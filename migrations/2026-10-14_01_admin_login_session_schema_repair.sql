-- Repair session storage for deployments created from older schema variants.
-- PostgreSQL can safely widen VARCHAR tokens to TEXT without losing session data.
DO $$
BEGIN
  IF to_regclass('public.sessions') IS NOT NULL THEN
    ALTER TABLE sessions ALTER COLUMN token TYPE TEXT USING token::TEXT;
    ALTER TABLE sessions ALTER COLUMN expires_at TYPE TIMESTAMPTZ USING expires_at::TIMESTAMPTZ;
    ALTER TABLE sessions ALTER COLUMN token SET NOT NULL;
    ALTER TABLE sessions ALTER COLUMN expires_at SET NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
