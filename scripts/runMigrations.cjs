const fs = require('node:fs');
const path = require('node:path');
const pg = require('pg');

const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error('DATABASE_URL is required. No migration was executed.');
  process.exit(1);
}

const migrationsDir = path.resolve(process.cwd(), 'migrations');
const files = fs.readdirSync(migrationsDir)
  .filter((name) => /^\d{4}[-_]\d{2}[-_]\d{2}.*\.sql$/.test(name))
  .sort();

if (files.length === 0) {
  console.log('No dated SQL migrations found.');
  process.exit(0);
}

const pool = new Pool({ connectionString: databaseUrl });

(async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const baseline = process.env.MIGRATION_BASELINE?.trim();
    if (baseline) {
      for (const file of files.filter((name) => name <= baseline)) {
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING',
          [file]
        );
      }
      console.log(`Baseline recorded through ${baseline}.`);
    }

    const applied = new Set(
      (await client.query('SELECT filename FROM schema_migrations')).rows.map((row) => row.filename)
    );

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`Skipping ${file} (already applied).`);
        continue;
      }

      console.log(`Applying ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`Applied ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    console.log(`Migration run complete: ${files.length} file(s) checked.`);
  } catch (error) {
    console.error('Migration failed. No later migration was executed.');
    console.error(error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
