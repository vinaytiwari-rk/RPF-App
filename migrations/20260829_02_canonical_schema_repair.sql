-- CANONICAL PRODUCTION DATABASE SCHEMA REPAIR MIGRATION
-- Migration File: 20260829_02_canonical_schema_repair.sql
-- Purpose: Complete schema contract synchronization for all production tables & missing columns.

-- 1. Core Users Table & Role Columns
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  password_hash VARCHAR(255),
  role VARCHAR(100) DEFAULT 'citizen',
  avatar TEXT,
  cover TEXT,
  points INT DEFAULT 0,
  "isVolunteer" BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(100) DEFAULT 'citizen';
ALTER TABLE users ADD COLUMN IF NOT EXISTS points INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "isVolunteer" BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cover TEXT;

-- 2. Volunteers Table & Role Column Fix
CREATE TABLE IF NOT EXISTS volunteers (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255),
  registration_number VARCHAR(100) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(50),
  email VARCHAR(255),
  city VARCHAR(255),
  area_locality VARCHAR(255),
  skills JSONB DEFAULT '[]'::jsonb,
  role VARCHAR(100) DEFAULT 'Volunteer',
  approval_status VARCHAR(50) DEFAULT 'approved',
  constituency_allocation VARCHAR(255),
  availability VARCHAR(100) DEFAULT 'available',
  avatar TEXT,
  "registeredAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS role VARCHAR(100) DEFAULT 'Volunteer';
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS city VARCHAR(255);
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS area_locality VARCHAR(255);
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'approved';
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS constituency_allocation VARCHAR(255);
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS availability VARCHAR(100) DEFAULT 'available';
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS avatar TEXT;

-- 3. Admin Credentials & Sessions
CREATE TABLE IF NOT EXISTS admin_credentials (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(100) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
  id VARCHAR(255) PRIMARY KEY,
  certificate_id VARCHAR(255) UNIQUE NOT NULL,
  volunteer_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  title_hi VARCHAR(255),
  recipient_name VARCHAR(255) NOT NULL,
  role VARCHAR(100) DEFAULT 'Volunteer',
  duty_hours INT DEFAULT 0,
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id VARCHAR(255) PRIMARY KEY,
  key VARCHAR(255) UNIQUE,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Volunteer Duty Sessions & Field Reports
CREATE TABLE IF NOT EXISTS volunteer_duty_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  user_phone VARCHAR(50),
  initiative_name VARCHAR(255),
  clock_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  clock_out_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  clock_in_lat NUMERIC,
  clock_in_lng NUMERIC,
  clock_out_lat NUMERIC,
  clock_out_lng NUMERIC,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS volunteer_field_reports (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  user_phone VARCHAR(50),
  title VARCHAR(255),
  description TEXT,
  approval_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS volunteer_reports (
  id VARCHAR(255) PRIMARY KEY,
  volunteer_id VARCHAR(255) NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  report_text TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS volunteer_tasks (
  id SERIAL PRIMARY KEY,
  "volunteerId" VARCHAR(255) NOT NULL,
  "titleEn" VARCHAR(255),
  "titleHi" VARCHAR(255),
  "descriptionEn" TEXT,
  "descriptionHi" TEXT,
  status VARCHAR(50) DEFAULT 'assigned',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Community Chat & Social Posts
CREATE TABLE IF NOT EXISTS community_chat_messages (
  id VARCHAR(255) PRIMARY KEY,
  "authorName" VARCHAR(255) NOT NULL,
  "authorAvatar" TEXT,
  text TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_posts (
  id VARCHAR(255) PRIMARY KEY,
  author VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  avatar TEXT,
  title VARCHAR(255),
  content TEXT NOT NULL,
  category VARCHAR(100),
  likes INT DEFAULT 0,
  liked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Blood Network Tables
CREATE TABLE IF NOT EXISTS blood_donors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  blood_group VARCHAR(10) NOT NULL,
  city VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  availability VARCHAR(50) DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blood_banks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  available_units JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Jobs & Employment
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  type VARCHAR(100) DEFAULT 'Full-time',
  description TEXT,
  requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_applications (
  id SERIAL PRIMARY KEY,
  job_id INT NOT NULL,
  applicant_name VARCHAR(255) NOT NULL,
  applicant_phone VARCHAR(50) NOT NULL,
  applicant_email VARCHAR(255),
  resume_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Women Safety & Complaints
CREATE TABLE IF NOT EXISTS women_complaints (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  complainant_name VARCHAR(255) NOT NULL,
  complainant_phone VARCHAR(50) NOT NULL,
  complaint_type VARCHAR(255),
  incident_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  description TEXT,
  suspect_details TEXT,
  is_emergency BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'pending',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_groups (
  id VARCHAR(255) PRIMARY KEY,
  group_name VARCHAR(255) NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_group_members (
  id SERIAL PRIMARY KEY,
  group_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_locations (
  id SERIAL PRIMARY KEY,
  group_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Health & Pediatric Profiles
CREATE TABLE IF NOT EXISTS health_camps (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  date TIMESTAMP WITH TIME ZONE,
  doctor_name VARCHAR(255),
  services_offered TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS health_vitals (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  systolic INT,
  diastolic INT,
  pulse INT,
  sugar_level NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pediatric_profile (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  child_age INT,
  child_weight NUMERIC,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vaccine_status (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  vaccine_name VARCHAR(255) NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Jan Seva Cards & Service Signatures
CREATE TABLE IF NOT EXISTS jan_seva_cards (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  card_number VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  dob VARCHAR(50),
  gender VARCHAR(50),
  address TEXT,
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_signatures (
  id SERIAL PRIMARY KEY,
  service_id VARCHAR(255) UNIQUE NOT NULL,
  signatory_1_name VARCHAR(255),
  signatory_1_designation VARCHAR(255),
  signatory_2_name VARCHAR(255),
  signatory_2_designation VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_submissions_v2 (
  id VARCHAR(255) PRIMARY KEY,
  service_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(50) DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Notifications, FCM Tokens & Password Reset
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fcm_tokens (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  token TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  request_ip VARCHAR(100),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS passkeys (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  public_key TEXT NOT NULL,
  counter INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. CMS & Content Tables
CREATE TABLE IF NOT EXISTS blogs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  goal_amount NUMERIC DEFAULT 0,
  raised_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS culture_events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS directory (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donations (
  id SERIAL PRIMARY KEY,
  donor_name VARCHAR(255) NOT NULL,
  amount NUMERIC DEFAULT 0,
  cause VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS epapers (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  pdf_url TEXT NOT NULL,
  publish_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS panchang_calendar (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  tithi VARCHAR(255),
  nakshatra VARCHAR(255),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS religious_culture (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rto_vehicles (
  id SERIAL PRIMARY KEY,
  plate_number VARCHAR(50) UNIQUE NOT NULL,
  owner_name VARCHAR(255),
  vehicle_model VARCHAR(255),
  registration_date DATE
);

CREATE TABLE IF NOT EXISTS scholarships (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS senior_citizens (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skills_training (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sos_alerts (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  location TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS street_ratings (
  id SERIAL PRIMARY KEY,
  location_name VARCHAR(255) NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  rating INT DEFAULT 5,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS success_stories (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_requests (
  id VARCHAR(255) PRIMARY KEY,
  "citizenName" VARCHAR(255) NOT NULL,
  "citizenPhone" VARCHAR(50),
  "requestType" VARCHAR(100),
  location TEXT,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
