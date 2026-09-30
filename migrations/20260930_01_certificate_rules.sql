-- Certificate automation rules. Idempotent and safe for existing certificates.
CREATE TABLE IF NOT EXISTS certificate_rules (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_hi VARCHAR(255),
  min_hours NUMERIC(10,2) DEFAULT 0,
  min_reports INT DEFAULT 0,
  min_tasks INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE certificate_rules ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE certificate_rules ADD COLUMN IF NOT EXISTS title_hi VARCHAR(255);
ALTER TABLE certificate_rules ADD COLUMN IF NOT EXISTS min_hours NUMERIC(10,2) DEFAULT 0;
ALTER TABLE certificate_rules ADD COLUMN IF NOT EXISTS min_reports INT DEFAULT 0;
ALTER TABLE certificate_rules ADD COLUMN IF NOT EXISTS min_tasks INT DEFAULT 0;
ALTER TABLE certificate_rules ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
ALTER TABLE certificate_rules ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE certificate_rules ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE certificates ADD COLUMN IF NOT EXISTS rule_id VARCHAR(100);

INSERT INTO certificate_rules (id,title,title_hi,min_hours,min_reports,min_tasks,active)
VALUES
('service-10-hours','Certificate of Service','सेवा योगदान प्रमाणपत्र',10,0,0,true),
('field-service','Certificate of Field Service','फील्ड सेवा योगदान प्रमाणपत्र',5,3,0,true),
('volunteer-excellence','Certificate of Volunteer Excellence','उत्कृष्ट स्वयंसेवक सेवा प्रमाणपत्र',25,5,2,true)
ON CONFLICT (id) DO NOTHING;
