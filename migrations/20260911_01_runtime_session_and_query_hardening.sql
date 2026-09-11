-- Runtime hardening: make the authentication session store a real migration-owned
-- table instead of creating schema during an individual login request.
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id
  ON sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
  ON sessions(expires_at);

-- Remove expired sessions opportunistically during migration. Runtime cleanup
-- can be handled separately; this keeps stale rows from accumulating after a
-- deployment that introduces the migration.
DELETE FROM sessions WHERE expires_at <= NOW();

-- Card application query paths used by the admin/card APIs.
CREATE INDEX IF NOT EXISTS idx_card_applications_v2_submitted_at
  ON card_applications_v2("submittedAt" DESC);

CREATE INDEX IF NOT EXISTS idx_card_applications_v2_user_id
  ON card_applications_v2("userId");

CREATE INDEX IF NOT EXISTS idx_card_applications_v2_card_no
  ON card_applications_v2("cardNo");

CREATE INDEX IF NOT EXISTS idx_card_applications_v2_id_number
  ON card_applications_v2("idNumber");
