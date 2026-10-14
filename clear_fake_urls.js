import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const connStr = process.env.LOCAL_DB_URL || process.env.DATABASE_URL;\nif (!connStr) throw new Error("Database configuration missing: set LOCAL_DB_URL or DATABASE_URL.");
const pool = new pg.Pool({ connectionString: connStr.replace(/@base(?=[:\/]|$)/g, '@localhost'), ssl: false });

pool.query("UPDATE system_configs SET config_value = '' WHERE config_key IN ('founder_image_url', 'foundation_logo', 'splash_logo')")
  .then(() => { console.log('Cleared fake image urls'); process.exit(0); })
  .catch(console.error);
