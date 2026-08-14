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
    for (const file of files) {
      console.log(`Applying ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query(sql);
      console.log(`Applied ${file}`);
    }
    console.log(`Migration run complete: ${files.length} file(s).`);
  } catch (error) {
    console.error('Migration failed. No later migration was executed.');
    console.error(error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
