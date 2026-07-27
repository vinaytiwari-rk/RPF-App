import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
};

const pool = new pg.Pool(poolConfig);

const sql = `
DROP TABLE IF EXISTS blood_requests CASCADE;
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

DROP TABLE IF EXISTS service_submissions CASCADE;
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

DROP TABLE IF EXISTS blood_donors CASCADE;
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

DROP TABLE IF EXISTS blood_appointments CASCADE;
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

-- Women complaints does not use an ID string from Node, so UUID default works.
DROP TABLE IF EXISTS women_complaints CASCADE;
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
`;

async function run() {
  console.log("Connecting to PostgreSQL to repair and align all tables...");
  try {
    await pool.query(sql);
    console.log("✅ Successfully repaired and aligned all Blood Network and Women Safety tables!");
  } catch(e) {
    console.error("❌ Error executing script:", e);
  } finally {
    pool.end();
  }
}
run();
