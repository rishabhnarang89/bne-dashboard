-- Migration: Add last_modified_by column to track who made changes
ALTER TABLE teachers ADD COLUMN last_modified_by TEXT;
ALTER TABLE interviews ADD COLUMN last_modified_by TEXT;
ALTER TABLE tasks ADD COLUMN last_modified_by TEXT;
