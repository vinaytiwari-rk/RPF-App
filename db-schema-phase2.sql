-- RPF Foundation Phase 2: Security Hardening
-- Safe to run multiple times.

BEGIN;

-- One-time password reset tokens.
-- New application code stores only a SHA-256 token hash; the raw token is
-- delivered only to the user and is never persisted.
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  token_hash CHAR(64),
  expires_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_ip INET,
  user_agent TEXT
);

-- Compatibility migrations for databases created by the older schema.
ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS token_hash CHAR(64);
ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS used_at TIMESTAMPTZ;
ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS request_ip INET;
ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS user_agent TEXT;

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id
  ON password_reset_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at
  ON password_reset_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_active
  ON password_reset_tokens(token_hash, expires_at)
  WHERE used_at IS NULL;

-- Token hashes are random 256-bit values and must never collide.
CREATE UNIQUE INDEX IF NOT EXISTS ux_password_reset_tokens_token_hash
  ON password_reset_tokens(token_hash)
  WHERE token_hash IS NOT NULL;

-- Remove only tokens that are already unusable. Active tokens are preserved.
DELETE FROM password_reset_tokens
WHERE expires_at IS NOT NULL
  AND (expires_at <= NOW() OR used_at IS NOT NULL);

COMMIT;
