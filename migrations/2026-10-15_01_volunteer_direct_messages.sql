-- Volunteer Activity private messaging and chat retention indexes.
-- Community messages are removed after 24 hours by the Activity chat API.
CREATE TABLE IF NOT EXISTS volunteer_direct_messages (
  id VARCHAR(255) PRIMARY KEY,
  sender_id VARCHAR(255) NOT NULL,
  recipient_id VARCHAR(255) NOT NULL,
  text TEXT NOT NULL CHECK (length(text) BETWEEN 1 AND 2000),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_volunteer_direct_messages_conversation
  ON volunteer_direct_messages (sender_id, recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_volunteer_direct_messages_recipient
  ON volunteer_direct_messages (recipient_id, sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_chat_messages_created_at
  ON community_chat_messages ("createdAt");
