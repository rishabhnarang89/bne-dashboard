-- ============================================================================
-- Migration 003: Add Missing Interview Columns
-- ============================================================================
-- This migration adds the missing columns to the interviews table that are
-- required by the frontend code but were not included in the initial schema.
--
-- CRITICAL: Run this migration IMMEDIATELY to fix the interview save issue.
-- Without these columns, interviews cannot be saved to the database.
-- ============================================================================

-- Add missing columns to interviews table
ALTER TABLE interviews 
ADD COLUMN IF NOT EXISTS duration INTEGER,
ADD COLUMN IF NOT EXISTS time_spent INTEGER,
ADD COLUMN IF NOT EXISTS questions JSONB;

-- Add comments for documentation
COMMENT ON COLUMN interviews.duration IS 'Scheduled duration of the interview in minutes';
COMMENT ON COLUMN interviews.time_spent IS 'Actual time spent on the interview in minutes';
COMMENT ON COLUMN interviews.questions IS 'JSON array of interview questions and answers';

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this after the migration to verify all columns exist:
--
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'interviews'
-- ORDER BY ordinal_position;
--
-- Expected columns:
-- - duration (integer, YES)
-- - time_spent (integer, YES)
-- - questions (jsonb, YES)
-- ============================================================================
