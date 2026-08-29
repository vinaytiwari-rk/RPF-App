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
    // Acquire PostgreSQL advisory lock to prevent concurrent migration race conditions
    await client.query('SELECT pg_advisory_lock(84920491)');

    // Create migration history tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    let appliedCount = 0;
    for (const file of files) {
      const checkRes = await client.query('SELECT 1 FROM schema_migrations WHERE name = $1', [file]);
      if (checkRes.rows.length > 0) {
        console.log(`Skipping already executed migration: ${file}`);
        continue;
      }

      console.log(`Applying ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      
      console.log(`Successfully applied ${file}`);
      appliedCount++;
    }
    console.log(`Migration run complete: ${appliedCount} new file(s) applied.`);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Migration failed. No later migration was executed.');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await client.query('SELECT pg_advisory_unlock(84920491)').catch(() => {});
    client.release();
    await pool.end();
  }
})();
