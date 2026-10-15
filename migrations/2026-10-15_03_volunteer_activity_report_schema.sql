-- Volunteer Activity report fields used by submission and review APIs.
-- Safe for existing production databases; no existing report data is deleted.
ALTER TABLE volunteer_field_reports
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS location_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS points_awarded INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_volunteer_field_reports_user_created
  ON volunteer_field_reports (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_volunteer_field_reports_approval_created
  ON volunteer_field_reports (approval_status, created_at DESC);
