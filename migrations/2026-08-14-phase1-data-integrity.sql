-- Phase 1 data-integrity foundation.
-- Canonical multilingual content: one logical field, locale resolved by the app.
CREATE TABLE IF NOT EXISTS service_content (
  id SERIAL PRIMARY KEY,
  service_id VARCHAR(255) UNIQUE NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  action_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE service_content ADD COLUMN IF NOT EXISTS content JSONB;
ALTER TABLE service_content ADD COLUMN IF NOT EXISTS action_url TEXT;
ALTER TABLE service_content ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE service_content SET content = '{}'::jsonb WHERE content IS NULL;
ALTER TABLE service_content ALTER COLUMN content SET DEFAULT '{}'::jsonb;
ALTER TABLE service_content ALTER COLUMN content SET NOT NULL;

-- Administrator audit trail: one canonical event stream for administrative mutations.
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS administrator_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id VARCHAR(255) NOT NULL,
  actor_role VARCHAR(50) NOT NULL DEFAULT 'admin',
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  request_id VARCHAR(255),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at ON administrator_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_actor ON administrator_audit_log (actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_entity ON administrator_audit_log (entity_type, entity_id, created_at DESC);

-- Keep the volunteer schema compatible with the unified Administrator contract.
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
UPDATE volunteers SET approval_status = 'pending' WHERE approval_status IS NULL OR approval_status = '';
UPDATE volunteers SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE volunteers SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;
