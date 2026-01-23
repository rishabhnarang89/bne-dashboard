-- ============================================================================
-- Migration: Add Outreach Tracking Fields to Teachers Table
-- Date: 2026-01-23
-- Description: Adds contact method, response dates, follow-up scheduling,
--              and contact attempt tracking to the teachers table
-- ============================================================================

-- Add new columns to teachers table
ALTER TABLE teachers
ADD COLUMN IF NOT EXISTS contact_method TEXT CHECK (contact_method IN ('linkedin', 'email', 'phone', 'in-person', 'other')),
ADD COLUMN IF NOT EXISTS response_date DATE,
ADD COLUMN IF NOT EXISTS last_contact_date DATE,
ADD COLUMN IF NOT EXISTS next_follow_up_date DATE,
ADD COLUMN IF NOT EXISTS linkedin_message_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_call_made BOOLEAN DEFAULT FALSE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_teachers_next_follow_up ON teachers(next_follow_up_date);
CREATE INDEX IF NOT EXISTS idx_teachers_last_contact ON teachers(last_contact_date);

-- ============================================================================
-- Verification Query
-- Run this to verify the migration was successful
-- ============================================================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'teachers'
-- AND column_name IN ('contact_method', 'response_date', 'last_contact_date', 
--                     'next_follow_up_date', 'linkedin_message_sent', 
--                     'email_sent', 'phone_call_made');
