-- CANONICAL PRODUCTION DATABASE SCHEMA REPAIR MIGRATION
-- Migration File: 20260829_02_canonical_schema_repair.sql
-- Purpose: Complete schema contract synchronization for all production tables & columns.
-- Safety Guarantee: 100% Idempotent, zero data loss, safe for populated production databases.

-- ====================================================================
-- 1. CORE USERS TABLE & ALL COLUMNS
-- ====================================================================
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
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(100) DEFAULT 'citizen';
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cover TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS points INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "isVolunteer" BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ====================================================================
-- 2. VOLUNTEERS TABLE & ALL COLUMNS
-- ====================================================================
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
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS username VARCHAR(255);
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS registration_number VARCHAR(100);
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS mobile VARCHAR(50);
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS city VARCHAR(255);
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS area_locality VARCHAR(255);
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS role VARCHAR(100) DEFAULT 'Volunteer';
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'approved';
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS constituency_allocation VARCHAR(255);
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS availability VARCHAR(100) DEFAULT 'available';
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS "registeredAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ====================================================================
-- 3. ADMIN CREDENTIALS & SESSIONS
-- ====================================================================
CREATE TABLE IF NOT EXISTS admin_credentials (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(100) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE admin_credentials ADD COLUMN IF NOT EXISTS username VARCHAR(255);
ALTER TABLE admin_credentials ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE admin_credentials ADD COLUMN IF NOT EXISTS role VARCHAR(100) DEFAULT 'admin';
ALTER TABLE admin_credentials ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS token TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ====================================================================
-- 4. CERTIFICATES TABLE & ALL COLUMNS
-- ====================================================================
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
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS certificate_id VARCHAR(255);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS volunteer_id VARCHAR(255);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS title_hi VARCHAR(255);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS recipient_name VARCHAR(255);
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS role VARCHAR(100) DEFAULT 'Volunteer';
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS duty_hours INT DEFAULT 0;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ====================================================================
-- 5. SETTINGS TABLE & ALL COLUMNS
-- ====================================================================
CREATE TABLE IF NOT EXISTS settings (
  id VARCHAR(255) PRIMARY KEY,
  key VARCHAR(255) UNIQUE,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS key VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS value TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ====================================================================
-- 6. VOLUNTEER DUTY SESSIONS & REPORTS
-- ====================================================================
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
ALTER TABLE volunteer_duty_sessions ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE volunteer_duty_sessions ADD COLUMN IF NOT EXISTS user_name VARCHAR(255);
ALTER TABLE volunteer_duty_sessions ADD COLUMN IF NOT EXISTS user_phone VARCHAR(50);
ALTER TABLE volunteer_duty_sessions ADD COLUMN IF NOT EXISTS initiative_name VARCHAR(255);
ALTER TABLE volunteer_duty_sessions ADD COLUMN IF NOT EXISTS clock_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE volunteer_duty_sessions ADD COLUMN IF NOT EXISTS clock_out_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE volunteer_duty_sessions ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT 0;
ALTER TABLE volunteer_duty_sessions ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE volunteer_duty_sessions ADD COLUMN IF NOT EXISTS clock_in_lat NUMERIC;
ALTER TABLE volunteer_duty_sessions ADD COLUMN IF NOT EXISTS clock_in_lng NUMERIC;
ALTER TABLE volunteer_duty_sessions ADD COLUMN IF NOT EXISTS clock_out_lat NUMERIC;
ALTER TABLE volunteer_duty_sessions ADD COLUMN IF NOT EXISTS clock_out_lng NUMERIC;
ALTER TABLE volunteer_duty_sessions ADD COLUMN IF NOT EXISTS notes TEXT;

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
ALTER TABLE volunteer_field_reports ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE volunteer_field_reports ADD COLUMN IF NOT EXISTS user_name VARCHAR(255);
ALTER TABLE volunteer_field_reports ADD COLUMN IF NOT EXISTS user_phone VARCHAR(50);
ALTER TABLE volunteer_field_reports ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE volunteer_field_reports ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE volunteer_field_reports ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE volunteer_field_reports ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

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
ALTER TABLE volunteer_reports ADD COLUMN IF NOT EXISTS volunteer_id VARCHAR(255);
ALTER TABLE volunteer_reports ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE volunteer_reports ADD COLUMN IF NOT EXISTS check_out_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE volunteer_reports ADD COLUMN IF NOT EXISTS report_text TEXT;
ALTER TABLE volunteer_reports ADD COLUMN IF NOT EXISTS location_lat NUMERIC;
ALTER TABLE volunteer_reports ADD COLUMN IF NOT EXISTS location_lng NUMERIC;
ALTER TABLE volunteer_reports ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

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
ALTER TABLE volunteer_tasks ADD COLUMN IF NOT EXISTS "volunteerId" VARCHAR(255);
ALTER TABLE volunteer_tasks ADD COLUMN IF NOT EXISTS "titleEn" VARCHAR(255);
ALTER TABLE volunteer_tasks ADD COLUMN IF NOT EXISTS "titleHi" VARCHAR(255);
ALTER TABLE volunteer_tasks ADD COLUMN IF NOT EXISTS "descriptionEn" TEXT;
ALTER TABLE volunteer_tasks ADD COLUMN IF NOT EXISTS "descriptionHi" TEXT;
ALTER TABLE volunteer_tasks ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'assigned';
ALTER TABLE volunteer_tasks ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ====================================================================
-- 7. COMMUNITY CHAT & SOCIAL POSTS
-- ====================================================================
CREATE TABLE IF NOT EXISTS community_chat_messages (
  id VARCHAR(255) PRIMARY KEY,
  "authorName" VARCHAR(255) NOT NULL,
  "authorAvatar" TEXT,
  text TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE community_chat_messages ADD COLUMN IF NOT EXISTS "authorName" VARCHAR(255);
ALTER TABLE community_chat_messages ADD COLUMN IF NOT EXISTS "authorAvatar" TEXT;
ALTER TABLE community_chat_messages ADD COLUMN IF NOT EXISTS text TEXT;
ALTER TABLE community_chat_messages ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

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
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS author VARCHAR(255);
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS role VARCHAR(100);
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS liked BOOLEAN DEFAULT FALSE;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ====================================================================
-- 8. BLOOD NETWORK TABLES
-- ====================================================================
CREATE TABLE IF NOT EXISTS blood_donors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  blood_group VARCHAR(10) NOT NULL,
  city VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  availability VARCHAR(50) DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE blood_donors ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE blood_donors ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10);
ALTER TABLE blood_donors ADD COLUMN IF NOT EXISTS city VARCHAR(255);
ALTER TABLE blood_donors ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE blood_donors ADD COLUMN IF NOT EXISTS availability VARCHAR(50) DEFAULT 'available';
ALTER TABLE blood_donors ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE TABLE IF NOT EXISTS blood_banks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  available_units JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE blood_banks ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE blood_banks ADD COLUMN IF NOT EXISTS city VARCHAR(255);
ALTER TABLE blood_banks ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE blood_banks ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE blood_banks ADD COLUMN IF NOT EXISTS available_units JSONB DEFAULT '{}'::jsonb;
ALTER TABLE blood_banks ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ====================================================================
-- 9. JOBS & EMPLOYMENT
-- ====================================================================
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
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS type VARCHAR(100) DEFAULT 'Full-time';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS requirements TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

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
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS job_id INT;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS applicant_name VARCHAR(255);
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS applicant_phone VARCHAR(50);
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS applicant_email VARCHAR(255);
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ====================================================================
-- 10. WOMEN SAFETY & COMPLAINTS
-- ====================================================================
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
ALTER TABLE women_complaints ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE women_complaints ADD COLUMN IF NOT EXISTS complainant_name VARCHAR(255);
ALTER TABLE women_complaints ADD COLUMN IF NOT EXISTS complainant_phone VARCHAR(50);
ALTER TABLE women_complaints ADD COLUMN IF NOT EXISTS complaint_type VARCHAR(255);
ALTER TABLE women_complaints ADD COLUMN IF NOT EXISTS incident_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE women_complaints ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE women_complaints ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE women_complaints ADD COLUMN IF NOT EXISTS suspect_details TEXT;
ALTER TABLE women_complaints ADD COLUMN IF NOT EXISTS is_emergency BOOLEAN DEFAULT FALSE;
ALTER TABLE women_complaints ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE women_complaints ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ====================================================================
-- 11. HEALTH & PEDIATRIC PROFILES
-- ====================================================================
CREATE TABLE IF NOT EXISTS health_camps (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  date TIMESTAMP WITH TIME ZONE,
  doctor_name VARCHAR(255),
  services_offered TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE health_camps ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE health_camps ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE health_camps ADD COLUMN IF NOT EXISTS date TIMESTAMP WITH TIME ZONE;
ALTER TABLE health_camps ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(255);
ALTER TABLE health_camps ADD COLUMN IF NOT EXISTS services_offered TEXT;
ALTER TABLE health_camps ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE TABLE IF NOT EXISTS health_vitals (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  systolic INT,
  diastolic INT,
  pulse INT,
  sugar_level NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE health_vitals ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE health_vitals ADD COLUMN IF NOT EXISTS systolic INT;
ALTER TABLE health_vitals ADD COLUMN IF NOT EXISTS diastolic INT;
ALTER TABLE health_vitals ADD COLUMN IF NOT EXISTS pulse INT;
ALTER TABLE health_vitals ADD COLUMN IF NOT EXISTS sugar_level NUMERIC;
ALTER TABLE health_vitals ADD COLUMN IF NOT EXISTS recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE TABLE IF NOT EXISTS medications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE medications ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE medications ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE medications ADD COLUMN IF NOT EXISTS dosage VARCHAR(100);
ALTER TABLE medications ADD COLUMN IF NOT EXISTS frequency VARCHAR(100);
ALTER TABLE medications ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE TABLE IF NOT EXISTS pediatric_profile (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  child_age INT,
  child_weight NUMERIC,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE pediatric_profile ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE pediatric_profile ADD COLUMN IF NOT EXISTS child_age INT;
ALTER TABLE pediatric_profile ADD COLUMN IF NOT EXISTS child_weight NUMERIC;
ALTER TABLE pediatric_profile ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE TABLE IF NOT EXISTS vaccine_status (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  vaccine_name VARCHAR(255) NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE vaccine_status ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE vaccine_status ADD COLUMN IF NOT EXISTS vaccine_name VARCHAR(255);
ALTER TABLE vaccine_status ADD COLUMN IF NOT EXISTS done BOOLEAN DEFAULT FALSE;
ALTER TABLE vaccine_status ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ====================================================================
-- 12. JAN SEVA CARDS & SERVICE SIGNATURES
-- ====================================================================
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
ALTER TABLE jan_seva_cards ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE jan_seva_cards ADD COLUMN IF NOT EXISTS card_number VARCHAR(100);
ALTER TABLE jan_seva_cards ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE jan_seva_cards ADD COLUMN IF NOT EXISTS dob VARCHAR(50);
ALTER TABLE jan_seva_cards ADD COLUMN IF NOT EXISTS gender VARCHAR(50);
ALTER TABLE jan_seva_cards ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE jan_seva_cards ADD COLUMN IF NOT EXISTS issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE jan_seva_cards ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'approved';
ALTER TABLE jan_seva_cards ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE TABLE IF NOT EXISTS service_signatures (
  id SERIAL PRIMARY KEY,
  service_id VARCHAR(255) UNIQUE NOT NULL,
  signatory_1_name VARCHAR(255),
  signatory_1_designation VARCHAR(255),
  signatory_2_name VARCHAR(255),
  signatory_2_designation VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE service_signatures ADD COLUMN IF NOT EXISTS service_id VARCHAR(255);
ALTER TABLE service_signatures ADD COLUMN IF NOT EXISTS signatory_1_name VARCHAR(255);
ALTER TABLE service_signatures ADD COLUMN IF NOT EXISTS signatory_1_designation VARCHAR(255);
ALTER TABLE service_signatures ADD COLUMN IF NOT EXISTS signatory_2_name VARCHAR(255);
ALTER TABLE service_signatures ADD COLUMN IF NOT EXISTS signatory_2_designation VARCHAR(255);
ALTER TABLE service_signatures ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE TABLE IF NOT EXISTS service_submissions_v2 (
  id VARCHAR(255) PRIMARY KEY,
  service_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(50) DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE service_submissions_v2 ADD COLUMN IF NOT EXISTS service_id VARCHAR(255);
ALTER TABLE service_submissions_v2 ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE service_submissions_v2 ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE service_submissions_v2 ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'submitted';
ALTER TABLE service_submissions_v2 ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ====================================================================
-- 13. NOTIFICATIONS, FCM TOKENS & PASSWORD RESET
-- ====================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE TABLE IF NOT EXISTS fcm_tokens (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  token TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE fcm_tokens ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE fcm_tokens ADD COLUMN IF NOT EXISTS token TEXT;
ALTER TABLE fcm_tokens ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

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
ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS token_hash VARCHAR(255);
ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS request_ip VARCHAR(100);
ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE TABLE IF NOT EXISTS passkeys (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  public_key TEXT NOT NULL,
  counter INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE passkeys ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE passkeys ADD COLUMN IF NOT EXISTS public_key TEXT;
ALTER TABLE passkeys ADD COLUMN IF NOT EXISTS counter INT DEFAULT 0;
ALTER TABLE passkeys ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Extra existing table alter protections
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS patient_name VARCHAR(255);
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS hospital_name VARCHAR(255);
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10);
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS units_needed INT;
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE grievances ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS urgency VARCHAR(50);
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS citizen_name VARCHAR(255);
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'submitted';
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE service_content ADD COLUMN IF NOT EXISTS service_id VARCHAR(255);
ALTER TABLE service_content ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '{}'::jsonb;
ALTER TABLE service_content ADD COLUMN IF NOT EXISTS action_url TEXT;
ALTER TABLE service_content ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
