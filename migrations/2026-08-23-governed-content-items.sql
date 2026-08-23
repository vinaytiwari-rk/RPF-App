-- Phase 1: unified governance for initiatives, announcements, banners and articles.
-- Nothing in this table is public unless an administrator explicitly publishes it.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS governed_content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(40) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  title_hi VARCHAR(255),
  summary_en TEXT,
  summary_hi TEXT,
  body_en TEXT,
  body_hi TEXT,
  image_url TEXT,
  link_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  sort_order INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  published_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT chk_governed_content_type CHECK (content_type IN ('initiative','announcement','banner','article')),
  CONSTRAINT chk_governed_content_status CHECK (status IN ('draft','review','published','archived')),
  CONSTRAINT chk_governed_content_expiry CHECK (expires_at IS NULL OR starts_at IS NULL OR expires_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_governed_content_public
  ON governed_content_items (content_type, status, starts_at, expires_at, sort_order, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_governed_content_admin
  ON governed_content_items (status, content_type, updated_at DESC);

-- Existing content is intentionally not migrated into the public state.
-- It must be reviewed and explicitly re-created/published by an administrator.
