-- Repair session storage for deployments created from older schema variants.
-- Expire incomplete legacy rows before enforcing the canonical session contract.
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE sessions ALTER COLUMN token TYPE TEXT USING token::TEXT;
UPDATE sessions SET expires_at = NOW() WHERE expires_at IS NULL;
ALTER TABLE sessions ALTER COLUMN expires_at TYPE TIMESTAMPTZ USING expires_at::TIMESTAMPTZ;
ALTER TABLE sessions ALTER COLUMN token SET NOT NULL;
ALTER TABLE sessions ALTER COLUMN expires_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
