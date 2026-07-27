-- Migration script for RP Foundation Database
-- Run this script via phpMyAdmin or psql using the vfpmlbpv user.

-- 1. Unify users table and add missing volunteer/auth columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_number VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS father_husband_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mother_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS education JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reason_for_joining TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS availability VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS national_id_1 VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS national_id_2 VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pincode VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS area_locality VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS sansad_kshetra VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS vidhan_sabha VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS ward_no VARCHAR(255);

-- 2. Create support tables if they don't exist
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  token VARCHAR(255) UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  "userId" VARCHAR(255),
  token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS service_content (
  id SERIAL PRIMARY KEY,
  service_id VARCHAR(255) UNIQUE,
  content_en TEXT,
  content_hi TEXT,
  action_label_en TEXT,
  action_label_hi TEXT,
  action_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure default super admin exists
INSERT INTO users (id, name, username, password_hash, role)
VALUES ('admin', 'System Administrator', 'admin', '$2a$10$D/x31v5.7r7j0U.tH1Mv3ui/b0f1UuVfOaB2b9m8mUoU0F3aXF7u6', 'super_admin')
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

-- ============================================================================
-- Blood Donation Network Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS blood_donors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
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
    "serviceName" VARCHAR(255),
    "submissionData" JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

