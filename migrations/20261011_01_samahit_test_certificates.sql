-- Migration for SAMAHIT Online Test Portal Certificates
CREATE TABLE IF NOT EXISTS test_certificates (
  id VARCHAR(255) PRIMARY KEY,
  certificate_id VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  candidate_name VARCHAR(255) NOT NULL,
  duration_minutes INT NOT NULL,
  total_questions INT NOT NULL,
  correct_count INT NOT NULL,
  score_percentage INT NOT NULL,
  grade VARCHAR(10) NOT NULL,
  category_breakdown JSONB,
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_certificates_user_id ON test_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_test_certificates_cert_id ON test_certificates(certificate_id);
