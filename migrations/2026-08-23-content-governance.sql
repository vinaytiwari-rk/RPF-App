-- Content Governance: campaigns + editable/publish-controlled metrics
-- Rule: Draft content and metrics are never public until an admin publishes them.

-- UUID defaults in this migration require pgcrypto.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF to_regclass('public.campaigns') IS NULL THEN
    CREATE TABLE campaigns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "titleEn" TEXT NOT NULL,
      "titleHi" TEXT,
      "goalAmount" NUMERIC(14,2) NOT NULL DEFAULT 0,
      "raisedAmount" NUMERIC(14,2) NOT NULL DEFAULT 0,
      "imageUrl" TEXT,
      "coverImgUrl" TEXT,
      urgent BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      published BOOLEAN NOT NULL DEFAULT false,
      "publishedAt" TIMESTAMP WITH TIME ZONE,
      "publishedBy" UUID
    );
  ELSE
    ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP WITH TIME ZONE;
    ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS "publishedBy" UUID;
    ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_campaigns_published_created
  ON campaigns (published, "createdAt" DESC);

-- Existing campaigns must be explicitly reviewed and published by an admin.
UPDATE campaigns SET published = false WHERE published IS DISTINCT FROM false;

CREATE TABLE IF NOT EXISTS content_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_key VARCHAR(100) UNIQUE NOT NULL,
  label_en VARCHAR(255) NOT NULL,
  label_hi VARCHAR(255),
  value NUMERIC(18,2) NOT NULL DEFAULT 0,
  unit VARCHAR(50),
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  published_by UUID
);

CREATE INDEX IF NOT EXISTS idx_content_metrics_published_order
  ON content_metrics (is_published, sort_order);
