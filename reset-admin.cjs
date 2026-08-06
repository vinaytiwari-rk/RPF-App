const pg = require("pg");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const dbUrl = process.env.LOCAL_DB_URL || process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/rp_foundation";

const pool = new pg.Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes("localhost") || dbUrl.includes("127.0.0.") ? false : { rejectUnauthorized: false }
});

async function run() {
  try {
    const password = "admin";
    const password_hash = await bcrypt.hash(password, 10);
    const userId = "admin-" + Date.now();
    const phone = "9999999999";
    
    // Check if any admin exists
    const existing = await pool.query("SELECT id, phone, email, role FROM users WHERE role IN ('admin', 'superadmin', 'super_admin')");
    
    if (existing.rows.length > 0) {
      console.log(`\nFound ${existing.rows.length} existing admin accounts:\n`);
      for (const user of existing.rows) {
        console.log(`- Role: ${user.role} | Phone: ${user.phone} | Email: ${user.email}`);
        await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [password_hash, user.id]);
        console.log(`  -> Password has been successfully reset to: admin\n`);
      }
    } else {
      console.log("\nNo existing admin accounts found. Creating a new super_admin account...");
      await pool.query(
        `INSERT INTO users (id, name, phone, password_hash, role) VALUES ($1, $2, $3, $4, $5)`,
        [userId, 'Super Admin', phone, password_hash, 'super_admin']
      );
      console.log(`\nAccount created!`);
      console.log(`User ID / Phone: ${phone}`);
      console.log(`Password: admin\n`);
    }
  } catch (err) {
    console.error("Database Error:", err);
  } finally {
    pool.end();
  }
}
run();
