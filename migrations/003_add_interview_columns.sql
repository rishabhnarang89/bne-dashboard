-- ============================================================================
-- Migration 003: Add Missing Interview Columns
-- ============================================================================
-- This migration adds the missing columns to the interviews table.
-- ============================================================================

-- Add missing columns to interviews table
ALTER TABLE interviews ADD COLUMN duration INTEGER;
ALTER TABLE interviews ADD COLUMN time_spent INTEGER;
ALTER TABLE interviews ADD COLUMN questions JSONB;
