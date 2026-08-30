-- CANONICAL PRODUCTION DATABASE SCHEMA REPAIR MIGRATION
-- Migration File: 2026-08-13-canonical-schema-repair.sql
-- Purpose: Execute schema contract synchronization FIRST before all 2026 feature migrations.
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
-- 2. VOLUNTEERS TABLE & ALL COLUMNS (INCL. ROLE & APPROVAL STATUS)
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
