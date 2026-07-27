import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Create pool without forcing SSL
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
};

const pool = new pg.Pool(poolConfig);

const sql = `
-- ============================================================================
-- Blood Donation Network Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS blood_donors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255),
    blood_group VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    last_donation_date DATE,
    is_available BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blood_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id VARCHAR(255),
    patient_name VARCHAR(255) NOT NULL,
    blood_group VARCHAR(10) NOT NULL,
    units_required INTEGER DEFAULT 1,
    hospital_name VARCHAR(255),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    urgency VARCHAR(50) DEFAULT 'normal',
    contact_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'open',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Women Safety Tables
-- ============================================================================

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

CREATE TABLE IF NOT EXISTS service_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
`;

async function run() {
  console.log("Connecting to PostgreSQL to create missing tables...");
  try {
    await pool.query(sql);
    console.log("✅ Successfully created Blood Network and Women Safety tables.");
  } catch(e) {
    console.error("❌ Error executing script:", e);
  } finally {
    pool.end();
  }
}
run();
