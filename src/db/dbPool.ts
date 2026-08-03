import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

export const dbUrl = process.env.LOCAL_DB_URL || process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/rp_foundation";

export const pool = new pg.Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes("localhost") || dbUrl.includes("127.0.0.") ? false : { rejectUnauthorized: false }
});
