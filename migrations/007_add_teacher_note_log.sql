-- ============================================================================
-- Migration 007: Add note_log to teachers
-- ============================================================================
-- Stores structured history of notes with timestamps and authors.
-- JSON array of objects: { date, author, text }
-- ============================================================================

ALTER TABLE teachers ADD COLUMN note_log JSONB;
