const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

async function fix() {
  const client = await pool.connect();
  try {
    console.log('=== Step 1: Create citizen_auth table ===');
    await client.query(`
      CREATE TABLE IF NOT EXISTS citizen_auth (
        user_id VARCHAR(255) PRIMARY KEY,
        password_hash VARCHAR(255) NOT NULL,
        username VARCHAR(255) UNIQUE,
        registration_number VARCHAR(255) UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('citizen_auth table created');

    await client.query('CREATE INDEX IF NOT EXISTS idx_citizen_auth_username ON citizen_auth(username)');
    console.log('index created');

    const r1 = await client.query('SELECT COUNT(*) FROM users');
    const r2 = await client.query('SELECT COUNT(*) FROM citizen_auth');
    console.log('users:', r1.rows[0].count, 'citizen_auth:', r2.rows[0].count);

    console.log('\nDone');
  } catch(e) {
    console.error('ERROR:', e.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fix();
