-- Migration: Add missing tables and columns for RPF-App
-- Date: 2023-08-15 (YYYYMMDD naming convention)
-- This migration closes gaps identified in Phase 5 audit.

-- 1. Add author_id foreign key to announcements (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='announcements' AND column_name='author_id') THEN
    ALTER TABLE announcements ADD COLUMN author_id UUID REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Ensure blood_requests has proper foreign key to users
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name='blood_requests' AND constraint_type='FOREIGN KEY' AND constraint_name='fk_blood_requests_requester') THEN
    ALTER TABLE blood_requests ADD CONSTRAINT fk_blood_requests_requester FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Add foreign key to grievances (citizen_id)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name='grievances' AND constraint_type='FOREIGN KEY' AND constraint_name='fk_grievances_citizen') THEN
    ALTER TABLE grievances ADD CONSTRAINT fk_grievances_citizen FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Create health_appointments table (if not exists)
CREATE TABLE IF NOT EXISTS health_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES users(id) ON DELETE SET NULL,
    appointment_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create service_requests table (if not exists)
CREATE TABLE IF NOT EXISTS service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL,
    payload JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new','processing','completed','failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_health_appointments_patient ON health_appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_appointments_provider ON health_appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_requester ON service_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);

-- End of migration
