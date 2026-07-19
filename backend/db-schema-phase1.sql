-- ============================================================================
-- PHASE 1: DATABASE SCHEMA - SECURE AUTHENTICATION FOUNDATION
-- ============================================================================
-- This SQL creates the foundation for secure authentication in RPF-App
-- Includes: users table with password hashing, sessions table for JWT tracking,
-- and audit logs for security compliance
-- ============================================================================

-- 1. DROP EXISTING TABLES (if migrating from old schema)
-- ⚠️ WARNING: This will delete existing data. Backup first!
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- 2. CREATE USERS TABLE (Secure Authentication)
-- ============================================================================
CREATE TABLE users (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Authentication credentials
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  -- bcrypt hash (60 chars minimum)
  
  -- User profile info
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  
  -- Role-based access control (RBAC)
  role VARCHAR(50) NOT NULL DEFAULT 'citizen' 
    CHECK (role IN ('citizen', 'volunteer', 'donor', 'admin', 'super_admin', 'guest')),
  
  -- Account status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'active' 
    CHECK (status IN ('active', 'pending', 'blocked', 'suspended', 'deleted')),
  
  -- Audit timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- Additional profile fields
  gender VARCHAR(50),
  dob DATE,
  address TEXT,
  is_volunteer BOOLEAN DEFAULT false,
  is_donor BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  points INTEGER DEFAULT 0,
  badges INTEGER DEFAULT 0,
  jan_seva_card_status VARCHAR(50) DEFAULT 'none' 
    CHECK (jan_seva_card_status IN ('none', 'pending', 'approved', 'rejected')),
  jan_seva_card_no VARCHAR(50)
);

-- Create indexes for faster queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================================================
-- 3. CREATE SESSIONS TABLE (JWT Token Tracking)
-- ============================================================================
CREATE TABLE sessions (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key to users table
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- JWT token storage (stored for invalidation tracking)
  token TEXT NOT NULL UNIQUE,
  
  -- Token metadata
  device_name VARCHAR(255),
  ip_address VARCHAR(45),  -- Supports both IPv4 and IPv6
  user_agent TEXT,
  
  -- Token lifecycle
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,  -- NULL = active, set to NOW() on logout
  
  -- Session status
  is_active BOOLEAN GENERATED ALWAYS AS 
    (revoked_at IS NULL AND expires_at > NOW()) STORED
);

-- Create indexes for efficient session lookups
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_revoked_at ON sessions(revoked_at);
CREATE INDEX idx_sessions_is_active ON sessions(is_active) WHERE is_active = true;

-- ============================================================================
-- 4. CREATE AUDIT_LOGS TABLE (Security Compliance & Debugging)
-- ============================================================================
CREATE TABLE audit_logs (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User who triggered the action
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Action details
  action VARCHAR(100) NOT NULL,  -- 'LOGIN', 'LOGOUT', 'REGISTER', 'UPDATE_ROLE', etc.
  resource_type VARCHAR(100),  -- 'USER', 'CARD_APPLICATION', 'GRIEVANCE', etc.
  resource_id UUID,  -- ID of the resource being acted upon
  
  -- Change tracking
  old_values JSONB,  -- Previous state (for updates)
  new_values JSONB,  -- New state (for updates)
  
  -- Request metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Optional notes
  notes TEXT
);

-- Create indexes for audit trail queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- ============================================================================
-- 5. CREATE CONSTRAINTS & TRIGGERS
-- ============================================================================

-- Update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at();

-- ============================================================================
-- 6. SEED INITIAL DATA (Optional - for development)
-- ============================================================================

-- Insert a test super_admin user (password: "admin123")
-- ⚠️ REMOVE THIS IN PRODUCTION - only for development/testing
INSERT INTO users (
  email, password_hash, name, role, status, is_volunteer, is_donor
) VALUES (
  'admin@rpfoundation.org',
  -- This is bcrypt hash of "admin123" - REPLACE IN PRODUCTION
  '$2b$10$5B0bTxKfCJ4ZAjp.YqJfnOz5Kb6r8PkQV2QGJ5W5n8KJ8LpD2YZZC',
  'Admin User',
  'super_admin',
  'active',
  false,
  false
) ON CONFLICT (email) DO NOTHING;

-- Insert a test citizen user (password: "citizen123")
INSERT INTO users (
  email, password_hash, name, role, status, is_volunteer, is_donor
) VALUES (
  'citizen@rpfoundation.org',
  -- This is bcrypt hash of "citizen123" - REPLACE IN PRODUCTION
  '$2b$10$sB5FTX8kEaR9Lz3KpQwMf.Z7NmK2VjX6L9OqXyC5HjW8UvQlR3MU',
  'Test Citizen',
  'citizen',
  'active',
  false,
  false
) ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 7. MIGRATION HELPER: COPY OLD USER DATA (if upgrading from existing schema)
-- ============================================================================

-- If you need to migrate users from the old "users" table structure,
-- you can use this query to map old columns to new ones:
-- 
-- INSERT INTO users_new (id, email, password_hash, name, phone, role, status, ...)
-- SELECT 
--   id,
--   email,
--   password_hash,
--   name,
--   phone,
--   role,
--   status,
--   ...
-- FROM old_users
-- WHERE email IS NOT NULL;
--
-- Then rename: ALTER TABLE users RENAME TO users_old; ALTER TABLE users_new RENAME TO users;

-- ============================================================================
-- 8. VERIFICATION QUERIES (Run these to verify setup)
-- ============================================================================

-- Check users table structure:
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns 
-- WHERE table_name = 'users' ORDER BY ordinal_position;

-- Check sessions table structure:
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns 
-- WHERE table_name = 'sessions' ORDER BY ordinal_position;

-- Check indexes created:
-- SELECT indexname, indexdef FROM pg_indexes 
-- WHERE tablename IN ('users', 'sessions', 'audit_logs');

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
