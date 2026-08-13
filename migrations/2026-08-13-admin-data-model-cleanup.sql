-- Canonical multilingual content model for administrator-managed service pages.
-- One database column stores all localized variants; the application selects the
-- requested locale at presentation time. No content_en/content_hi pair is kept.

CREATE TABLE IF NOT EXISTS service_content (
  id SERIAL PRIMARY KEY,
  service_id VARCHAR(255) UNIQUE NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
DECLARE
  has_content_en BOOLEAN;
  has_content_hi BOOLEAN;
  has_action_label_en BOOLEAN;
  has_action_label_hi BOOLEAN;
  has_action_url BOOLEAN;
  has_content BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'service_content' AND column_name = 'content_en'
  ) INTO has_content_en;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'service_content' AND column_name = 'content_hi'
  ) INTO has_content_hi;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'service_content' AND column_name = 'action_label_en'
  ) INTO has_action_label_en;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'service_content' AND column_name = 'action_label_hi'
  ) INTO has_action_label_hi;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'service_content' AND column_name = 'action_url'
  ) INTO has_action_url;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'service_content' AND column_name = 'content'
  ) INTO has_content;

  IF has_content THEN
    IF has_content_en OR has_content_hi OR has_action_label_en OR has_action_label_hi OR has_action_url THEN
      EXECUTE format($sql$
        UPDATE service_content
        SET content = COALESCE(content, '{}'::jsonb) || jsonb_build_object(
          'en', jsonb_build_object(
            'body', %s,
            'actionLabel', %s,
            'actionUrl', %s
          ),
          'hi', jsonb_build_object(
            'body', %s,
            'actionLabel', %s,
            'actionUrl', %s
          )
        )
        WHERE content IS NULL OR content = '{}'::jsonb
      $sql$,
        CASE WHEN has_content_en THEN 'COALESCE(content_en, '''')' ELSE '''''' END,
        CASE WHEN has_action_label_en THEN 'COALESCE(action_label_en, '''')' ELSE '''''' END,
        CASE WHEN has_action_url THEN 'COALESCE(action_url, '''')' ELSE '''''' END,
        CASE WHEN has_content_hi THEN 'COALESCE(content_hi, '''')' ELSE '''''' END,
        CASE WHEN has_action_label_hi THEN 'COALESCE(action_label_hi, '''')' ELSE '''''' END,
        CASE WHEN has_action_url THEN 'COALESCE(action_url, '''')' ELSE '''''' END
      );
    END IF;
  END IF;
END $$;

ALTER TABLE service_content ALTER COLUMN content SET DEFAULT '{}'::jsonb;
ALTER TABLE service_content ALTER COLUMN content SET NOT NULL;

-- Remove the legacy duplicate language columns after data has been copied.
ALTER TABLE service_content DROP COLUMN IF EXISTS content_en;
ALTER TABLE service_content DROP COLUMN IF EXISTS content_hi;
ALTER TABLE service_content DROP COLUMN IF EXISTS action_label_en;
ALTER TABLE service_content DROP COLUMN IF EXISTS action_label_hi;
