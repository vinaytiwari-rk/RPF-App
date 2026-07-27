import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
};

const pool = new pg.Pool(poolConfig);

async function run() {
  console.log("Connecting to PostgreSQL to repair and align all tables...");
  try {
    // 1. Repair blood_requests
    try {
      await pool.query(`DROP TABLE IF EXISTS blood_requests CASCADE;`);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS blood_requests (
            id VARCHAR(255) PRIMARY KEY,
            user_id VARCHAR(255),
            blood_group VARCHAR(10) NOT NULL,
            component_type VARCHAR(100),
            quantity INTEGER DEFAULT 1,
            urgency VARCHAR(50) DEFAULT 'Normal',
            status VARCHAR(50) DEFAULT 'Pending',
            doctor_name VARCHAR(255),
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ blood_requests repaired.");
    } catch(e) {
      console.log("⚠️ Could not drop blood_requests. Attempting ALTER...");
      try {
        await pool.query(`ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS user_id VARCHAR(255), ADD COLUMN IF NOT EXISTS component_type VARCHAR(100), ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1, ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(255), ADD COLUMN IF NOT EXISTS notes TEXT, ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`);
        console.log("✅ blood_requests ALTERED.");
      } catch(e2) {
        console.error("❌ Failed to alter blood_requests:", e2.message);
      }
    }

    // 2. Repair service_submissions
    try {
      await pool.query(`DROP TABLE IF EXISTS service_submissions CASCADE;`);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS service_submissions (
            id VARCHAR(255) PRIMARY KEY,
            "userId" VARCHAR(255),
            "citizenName" VARCHAR(255),
            "citizenPhone" VARCHAR(50),
            "serviceNameEn" VARCHAR(255),
            "serviceName" VARCHAR(255),
            "submissionData" JSONB,
            status VARCHAR(50) DEFAULT 'pending',
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ service_submissions repaired.");
    } catch(e) {
      console.log("⚠️ Could not drop service_submissions. Attempting ALTER to add missing columns...");
      try {
        await pool.query(`ALTER TABLE service_submissions ADD COLUMN IF NOT EXISTS "serviceNameEn" VARCHAR(255), ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`);
        console.log("✅ service_submissions ALTERED successfully.");
      } catch(e2) {
        console.error("❌ Failed to alter service_submissions:", e2.message);
      }
    }

    // 3. Repair blood_donors
    try {
      await pool.query(`DROP TABLE IF EXISTS blood_donors CASCADE;`);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS blood_donors (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255),
            "bloodGroup" VARCHAR(10) NOT NULL,
            phone VARCHAR(50),
            location VARCHAR(255),
            verified BOOLEAN DEFAULT false,
            distance VARCHAR(50),
            "lastDonated" VARCHAR(100),
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ blood_donors repaired.");
    } catch(e) {
      console.log("⚠️ Could not drop blood_donors. Attempting ALTER...");
      try {
        await pool.query(`ALTER TABLE blood_donors ADD COLUMN IF NOT EXISTS name VARCHAR(255), ADD COLUMN IF NOT EXISTS "bloodGroup" VARCHAR(10), ADD COLUMN IF NOT EXISTS phone VARCHAR(50), ADD COLUMN IF NOT EXISTS location VARCHAR(255), ADD COLUMN IF NOT EXISTS verified BOOLEAN, ADD COLUMN IF NOT EXISTS distance VARCHAR(50), ADD COLUMN IF NOT EXISTS "lastDonated" VARCHAR(100);`);
        console.log("✅ blood_donors ALTERED.");
      } catch(e2) {
        console.error("❌ Failed to alter blood_donors:", e2.message);
      }
    }

    // 4. Repair blood_appointments
    try {
      await pool.query(`DROP TABLE IF EXISTS blood_appointments CASCADE;`);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS blood_appointments (
            id VARCHAR(255) PRIMARY KEY,
            user_id VARCHAR(255),
            blood_bank_id VARCHAR(255),
            appointment_date VARCHAR(255),
            blood_group VARCHAR(10),
            status VARCHAR(50) DEFAULT 'Scheduled',
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ blood_appointments repaired.");
    } catch(e) {
      console.log("⚠️ Could not drop blood_appointments. Attempting ALTER...");
    }

    // 5. Repair women_complaints
    try {
      await pool.query(`DROP TABLE IF EXISTS women_complaints CASCADE;`);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS women_complaints (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id VARCHAR(255),
            complainant_name VARCHAR(255),
            complainant_phone VARCHAR(50),
            complaint_type VARCHAR(100),
            incident_date TIMESTAMP WITH TIME ZONE,
            location VARCHAR(255),
            description TEXT,
            suspect_details TEXT,
            is_anonymous BOOLEAN DEFAULT FALSE,
            status VARCHAR(50) DEFAULT 'pending',
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✅ women_complaints repaired.");
    } catch(e) {
      console.log("⚠️ Could not drop women_complaints. Attempting ALTER...");
    }

  } catch(e) {
    console.error("❌ Global error:", e.message);
  } finally {
    pool.end();
  }
}
run();
