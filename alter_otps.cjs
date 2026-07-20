const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
async function test() {
  try {
    await pool.query('ALTER TABLE otps ALTER COLUMN phone TYPE VARCHAR(255)');
    console.log("Table altered successfully.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    pool.end();
  }
}
test();
