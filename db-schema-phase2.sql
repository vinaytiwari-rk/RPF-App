-- RPF Foundation Phase 2: Security Hardening
-- Safe to run multiple times.

BEGIN;

-- One-time password reset tokens. Store only a hash of the token,
-- never the raw token that is sent to the user.
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_ip INET,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id
  ON password_reset_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at
  ON password_reset_tokens(expires_at);

-- A token can be used only once and only while valid.
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_active
  ON password_reset_tokens(token_hash, expires_at)
  WHERE used_at IS NULL;

-- Remove already-expired tokens; active tokens are untouched.
DELETE FROM password_reset_tokens
WHERE expires_at <= NOW() OR used_at IS NOT NULL;

COMMIT;
