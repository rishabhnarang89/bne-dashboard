-- Migration: Add assignees column to tasks table
-- Use JSON array for multiple assignees

ALTER TABLE tasks ADD COLUMN assignees TEXT DEFAULT '[]';

-- Migrate existing assignee data to assignees array
UPDATE tasks SET assignees = '["' || assignee || '"]' WHERE assignee IS NOT NULL;
UPDATE tasks SET assignees = '[]' WHERE assignee IS NULL;

-- Drop old assignee check constraint if possible (SQLite doesn't support dropping constraints easily, so we just ignore the old column for now)
