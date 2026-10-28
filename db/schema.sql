CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT,
  body TEXT,
  booking_id TEXT,
  is_read INTEGER DEFAULT 0,
  created_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

CREATE TABLE IF NOT EXISTS push_tokens (
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  PRIMARY KEY (user_id, token)
);
