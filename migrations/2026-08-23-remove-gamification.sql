BEGIN;

-- Samahit does not use points, badges, levels or leaderboards.
-- Remove legacy gamification columns from the live users table if present.
ALTER TABLE users
  DROP COLUMN IF EXISTS points,
  DROP COLUMN IF EXISTS badges;

COMMIT;
