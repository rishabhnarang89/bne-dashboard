-- ============================================================================
-- Migration 006: Add interviewer and observer to interviews
-- ============================================================================
-- Tracks who conducted the interview and who observed.
-- Both reference team members (rishabh, tung, johannes).
-- An interviewer cannot be their own observer (enforced in UI).
-- ============================================================================

ALTER TABLE interviews ADD COLUMN interviewer TEXT;
ALTER TABLE interviews ADD COLUMN observer TEXT;
