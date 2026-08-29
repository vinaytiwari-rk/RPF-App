import fs from 'fs';
import path from 'path';

export async function runMigrationsOnPool(pool: any) {
  const candidates = [
    path.resolve(__dirname, 'migrations'),
    path.resolve(process.cwd(), 'migrations'),
    path.resolve(path.dirname(process.argv[1] || ''), 'migrations'),
  ];
  const migrationsDir = candidates.find(dir => fs.existsSync(dir)) || candidates[0];
  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found on server boot. Checked paths:', candidates.join(', '));
    return;
  }

  const files = fs.readdirSync(migrationsDir)
    .filter((name: string) => /^\d{4}[-_]\d{2}[-_]\d{2}.*\.sql$/.test(name))
    .sort();

  if (files.length === 0) {
    console.log('No dated SQL migrations found.');
    return;
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('SELECT pg_advisory_lock(84920491)');

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
        continue;
      }

      console.log(`Applying server boot migration: ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');

      console.log(`Successfully applied server boot migration: ${file}`);
      appliedCount++;
    }
    if (appliedCount > 0) {
      console.log(`Server boot migration complete: ${appliedCount} file(s) applied successfully.`);
    }
  } catch (err: any) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('Server boot database migration failed:', err.message);
  } finally {
    if (client) {
      await client.query('SELECT pg_advisory_unlock(84920491)').catch(() => {});
      client.release();
    }
  }
}
