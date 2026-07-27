import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  console.log("Connecting to PostgreSQL to run migration.sql...");
  try {
    const sql = fs.readFileSync('migration.sql', 'utf8');
    await pool.query(sql);
    console.log("✅ Successfully executed migration.sql");
    console.log("All tables (including blood_requests, women_complaints) have been created or updated.");
  } catch(e) {
    console.error("❌ Error executing migration:", e);
  } finally {
    pool.end();
  }
}
run();
