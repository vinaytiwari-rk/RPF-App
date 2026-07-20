const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.LOCAL_DB_URL || process.env.DATABASE_URL
});

async function run() {
  try {
    await pool.query('DROP TABLE IF EXISTS otps');
    console.log("Old otps table dropped.");
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
