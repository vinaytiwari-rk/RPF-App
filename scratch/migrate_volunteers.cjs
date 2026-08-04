const dotenv = require('dotenv');
dotenv.config();
const { Pool } = require('pg');

const dbUrl = process.env.LOCAL_DB_URL || process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/rp_foundation";

const pool = new Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes("localhost") || dbUrl.includes("127.0.0.") ? false : { rejectUnauthorized: false }
});

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
