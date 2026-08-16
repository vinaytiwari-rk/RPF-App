-- Phase 1: keep administrator volunteer endpoints compatible with the canonical volunteer schema.
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
UPDATE volunteers SET approval_status='pending' WHERE approval_status IS NULL OR approval_status='';
UPDATE volunteers SET created_at=CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE volunteers SET updated_at=CURRENT_TIMESTAMP WHERE updated_at IS NULL;
