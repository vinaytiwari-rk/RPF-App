import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const { Pool } = pg;
const pool = new Pool();
async function run() {
  try {
    await pool.query('ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT \'pending\'');
    await pool.query('ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE');
    await pool.query('ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)');
    await pool.query('ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS registration_number VARCHAR(255) UNIQUE');
    console.log('Columns added successfully');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}
run();
