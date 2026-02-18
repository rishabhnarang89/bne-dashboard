-- Create Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'COMPLETE'
  entity_type TEXT NOT NULL, -- 'TEACHER', 'INTERVIEW', 'TASK'
  entity_id INTEGER,
  entity_name TEXT,
  details TEXT, -- JSON string or description
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster retrieval by date
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
