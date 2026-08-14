-- Phase 5 production completion: core data-contract foundation.
-- PostgreSQL only. Safe for repeated execution.
-- This migration MUST be reviewed/applied against the target database before production use.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Announcements are managed by the Administrator and consumed by Home/notifications.
CREATE TABLE IF NOT EXISTS announcements (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_announcements_active_created
  ON announcements (is_active, created_at DESC);

-- Volunteer records already exist in the application schema; only reconcile fields used by Phase 5.
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_volunteers_approval_status ON volunteers (approval_status);

-- Blood requests are user-owned operational records.
CREATE TABLE IF NOT EXISTS blood_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id VARCHAR(255),
  patient_name VARCHAR(255) NOT NULL,
  blood_group VARCHAR(10) NOT NULL,
  units_required INTEGER NOT NULL DEFAULT 1,
  hospital_name VARCHAR(255),
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  urgency VARCHAR(50) NOT NULL DEFAULT 'normal',
  contact_phone VARCHAR(50),
  notes TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS requester_id VARCHAR(255);
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS patient_name VARCHAR(255);
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10);
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS units_required INTEGER DEFAULT 1;
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS hospital_name VARCHAR(255);
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10,8);
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11,8);
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS urgency VARCHAR(50) DEFAULT 'normal';
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'open';
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_blood_requests_group_status ON blood_requests (blood_group, status);
CREATE INDEX IF NOT EXISTS idx_blood_requests_requester ON blood_requests (requester_id, created_at DESC);

-- Public grievance records.
CREATE TABLE IF NOT EXISTS grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  priority VARCHAR(30) NOT NULL DEFAULT 'normal',
  status VARCHAR(50) NOT NULL DEFAULT 'submitted',
  location TEXT,
  contact_phone VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS priority VARCHAR(30) DEFAULT 'normal';
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'submitted';
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_grievances_user_status ON grievances (user_id, status, created_at DESC);

-- Health appointment requests. Sensitive health information should not be exposed beyond the owning user and authorized staff.
CREATE TABLE IF NOT EXISTS health_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255),
  appointment_date TIMESTAMPTZ,
  department VARCHAR(150),
  doctor_name VARCHAR(255),
  notes TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'requested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE health_appointments ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE health_appointments ADD COLUMN IF NOT EXISTS appointment_date TIMESTAMPTZ;
ALTER TABLE health_appointments ADD COLUMN IF NOT EXISTS department VARCHAR(150);
ALTER TABLE health_appointments ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(255);
ALTER TABLE health_appointments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE health_appointments ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'requested';
ALTER TABLE health_appointments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE health_appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_health_appointments_user_status ON health_appointments (user_id, status, appointment_date DESC);

-- Generic service submissions used by service workflows that do not have a dedicated table.
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255),
  service_id VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_service_requests_user_created ON service_requests (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_requests_service_status ON service_requests (service_id, status, created_at DESC);

-- File metadata; binary objects remain in the configured storage provider.
CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255),
  original_name TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  mime_type VARCHAR(150),
  size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_uploads_user_created ON uploads (user_id, created_at DESC);

COMMIT;
