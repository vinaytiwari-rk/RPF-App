-- Keep the blood-donor API compatible with the canonical snake_case schema.
-- Additive only: existing donor rows and identifiers are preserved.
ALTER TABLE blood_donors ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE blood_donors ADD COLUMN IF NOT EXISTS last_donation_date DATE;

CREATE INDEX IF NOT EXISTS idx_blood_donors_created_at
  ON blood_donors(created_at DESC);
