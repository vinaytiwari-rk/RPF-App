-- Persistent administrator audit trail.
-- Keep actor, action and entity information in one canonical record so every
-- administrative mutation can be traced without duplicating data structures.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS administrator_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id VARCHAR(255) NOT NULL,
  actor_role VARCHAR(50) NOT NULL DEFAULT 'admin',
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  request_id VARCHAR(255),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at
  ON administrator_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_actor
  ON administrator_audit_log (actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_entity
  ON administrator_audit_log (entity_type, entity_id, created_at DESC);
