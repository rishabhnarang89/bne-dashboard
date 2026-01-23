-- ============================================================================
-- CRITICAL MIGRATION: Fix All Save Issues
-- ============================================================================
-- This migration fixes BOTH teacher and interview save failures by adding
-- all missing columns that the frontend code expects but the database lacks.
--
-- RUN THIS IMMEDIATELY to restore full functionality!
-- ============================================================================

-- ============================================================================
-- PART 1: Fix Interviews Table (Missing: duration, time_spent, questions)
-- ============================================================================

ALTER TABLE interviews 
ADD COLUMN IF NOT EXISTS duration INTEGER,
ADD COLUMN IF NOT EXISTS time_spent INTEGER,
ADD COLUMN IF NOT EXISTS questions JSONB;

COMMENT ON COLUMN interviews.duration IS 'Scheduled duration of the interview in minutes';
COMMENT ON COLUMN interviews.time_spent IS 'Actual time spent on the interview in minutes';
COMMENT ON COLUMN interviews.questions IS 'JSON array of interview questions and answers';

-- ============================================================================
-- PART 2: Fix Teachers Table (Missing: outreach tracking columns)
-- ============================================================================

-- Check if columns already exist (from migration 002) and add if missing
ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS contact_method TEXT CHECK (contact_method IN ('linkedin', 'email', 'phone', 'in-person', 'other')),
ADD COLUMN IF NOT EXISTS response_date DATE,
ADD COLUMN IF NOT EXISTS last_contact_date DATE,
ADD COLUMN IF NOT EXISTS next_follow_up_date DATE,
ADD COLUMN IF NOT EXISTS linkedin_message_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_call_made BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN teachers.contact_method IS 'Primary method of contact with this teacher';
COMMENT ON COLUMN teachers.response_date IS 'Date when teacher first responded';
COMMENT ON COLUMN teachers.last_contact_date IS 'Most recent outreach attempt';
COMMENT ON COLUMN teachers.next_follow_up_date IS 'Scheduled next follow-up date';
COMMENT ON COLUMN teachers.linkedin_message_sent IS 'Whether a LinkedIn message was sent';
COMMENT ON COLUMN teachers.email_sent IS 'Whether an email was sent';
COMMENT ON COLUMN teachers.phone_call_made IS 'Whether a phone call was made';

-- ============================================================================
-- PART 3: Add Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_teachers_next_follow_up ON teachers(next_follow_up_date);
CREATE INDEX IF NOT EXISTS idx_teachers_last_contact ON teachers(last_contact_date);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these after the migration to confirm everything is correct:

-- 1. Check interviews table columns:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'interviews'
-- ORDER BY ordinal_position;

-- 2. Check teachers table columns:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'teachers'
-- ORDER BY ordinal_position;

-- ============================================================================
-- EXPECTED RESULTS
-- ============================================================================
-- After running this migration:
-- ✅ Interviews will save with duration, time_spent, and questions
-- ✅ Teachers will save with all outreach tracking fields
-- ✅ No more 400 Bad Request errors
-- ✅ Data will persist after page refresh
-- ============================================================================
