-- Canonical multilingual content model for administrator-managed service pages.
-- One database column stores all localized values. The application selects the
-- requested locale at presentation time; there are no language-specific content
-- columns.

CREATE TABLE IF NOT EXISTS service_content (
  id SERIAL PRIMARY KEY,
  service_id VARCHAR(255) UNIQUE NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  action_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE service_content ADD COLUMN IF NOT EXISTS content JSONB;
ALTER TABLE service_content ADD COLUMN IF NOT EXISTS action_url TEXT;
ALTER TABLE service_content ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

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
    IF has_content_en OR has_content_hi OR has_action_label_en OR has_action_label_hi THEN
      EXECUTE format($sql$
        UPDATE service_content
        SET content = COALESCE(content, '{}'::jsonb) || jsonb_build_object(
          'en', jsonb_build_object(
            'body', %s,
            'actionLabel', %s
          ),
          'hi', jsonb_build_object(
            'body', %s,
            'actionLabel', %s
          )
        )
        WHERE content IS NULL OR content = '{}'::jsonb
      $sql$,
        CASE WHEN has_content_en THEN 'COALESCE(content_en, '''')' ELSE '''''' END,
        CASE WHEN has_action_label_en THEN 'COALESCE(action_label_en, '''')' ELSE '''''' END,
        CASE WHEN has_content_hi THEN 'COALESCE(content_hi, '''')' ELSE '''''' END,
        CASE WHEN has_action_label_hi THEN 'COALESCE(action_label_hi, '''')' ELSE '''''' END
      );
    END IF;

    -- Preserve the legacy action URL in the canonical action_url column only
    -- when that column was already present in the old schema.
    IF has_action_url THEN
      EXECUTE 'UPDATE service_content SET action_url = COALESCE(action_url, '''') WHERE action_url IS NULL';
    END IF;
  END IF;
END $$;

UPDATE service_content SET content = '{}'::jsonb WHERE content IS NULL;
ALTER TABLE service_content ALTER COLUMN content SET DEFAULT '{}'::jsonb;
ALTER TABLE service_content ALTER COLUMN content SET NOT NULL;

-- Remove the legacy duplicate language columns after their values have been
-- copied into the single canonical JSONB field.
ALTER TABLE service_content DROP COLUMN IF EXISTS content_en;
ALTER TABLE service_content DROP COLUMN IF EXISTS content_hi;
ALTER TABLE service_content DROP COLUMN IF EXISTS action_label_en;
ALTER TABLE service_content DROP COLUMN IF EXISTS action_label_hi;
