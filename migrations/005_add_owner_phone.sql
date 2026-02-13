-- Migration 005: Add owner and phone_number to teachers, update tasks assignee
-- SAFE: All changes are additive (ADD COLUMN with nullable defaults)
-- No existing data is modified except renaming 'both' -> 'all' in tasks.assignee

-- Add owner field to teachers (who is responsible for this contact)
ALTER TABLE teachers ADD COLUMN owner TEXT;

-- Add phone_number field to teachers
ALTER TABLE teachers ADD COLUMN phone_number TEXT;

-- Migrate existing 'both' assignee values to 'all' in tasks
UPDATE tasks SET assignee = 'all' WHERE assignee = 'both';
