-- ============================================================================
-- PHASE 1: DATABASE SCHEMA - SECURE AUTHENTICATION FOUNDATION
-- ============================================================================
-- Production schema only. No test/demo accounts or default passwords are seeded.
-- ============================================================================

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'citizen'
    CHECK (role IN ('citizen', 'volunteer', 'donor', 'admin', 'super_admin', 'guest')),
  status VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'pending', 'blocked', 'suspended', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
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

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  device_name VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN GENERATED ALWAYS AS
    (revoked_at IS NULL AND expires_at > NOW()) STORED
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_revoked_at ON sessions(revoked_at);
CREATE INDEX idx_sessions_is_active ON sessions(is_active) WHERE is_active = true;

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

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

-- IMPORTANT: No development/test users are inserted here.
-- Production/admin provisioning must be performed through the controlled
-- provisioning process with a securely supplied password and audit trail.

-- Verification queries (manual):
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns
-- WHERE table_name = 'users' ORDER BY ordinal_position;
-- SELECT indexname, indexdef FROM pg_indexes
-- WHERE tablename IN ('users', 'sessions', 'audit_logs');
