-- ============================================================================
-- BNE Validation Dashboard - Supabase Schema
-- Run this in the Supabase SQL Editor: 
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
-- ============================================================================

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    notes TEXT,
    week_id INTEGER NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    due_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_default BOOLEAN DEFAULT FALSE,
    subtasks JSONB DEFAULT '[]'::JSONB,
    linked_interview_id INTEGER,
    assignee TEXT CHECK (assignee IN ('rishabh', 'tung', 'both'))
);

-- Teachers table (CRM)
CREATE TABLE IF NOT EXISTS teachers (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    designation TEXT,
    department TEXT,
    school TEXT NOT NULL,
    school_type TEXT NOT NULL CHECK (school_type IN ('Gymnasium', 'Realschule', 'Gesamtschule', 'Grundschule', 'Other')),
    email TEXT,
    linkedin_url TEXT,
    request_sent_date DATE,
    status TEXT NOT NULL CHECK (status IN ('identified', 'request_sent', 'connected', 'scheduled', 'interviewed', 'follow_up')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Outreach tracking fields
    contact_method TEXT CHECK (contact_method IN ('linkedin', 'email', 'phone', 'in-person', 'other')),
    response_date DATE,
    last_contact_date DATE,
    next_follow_up_date DATE,
    linkedin_message_sent BOOLEAN DEFAULT FALSE,
    email_sent BOOLEAN DEFAULT FALSE,
    phone_call_made BOOLEAN DEFAULT FALSE
);

-- Interviews table (linked to teachers)
CREATE TABLE IF NOT EXISTS interviews (
    id BIGINT PRIMARY KEY,
    teacher_id BIGINT REFERENCES teachers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    scheduled_date DATE,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    setup_time INTEGER NOT NULL DEFAULT 0,
    success TEXT NOT NULL CHECK (success IN ('yes', 'no')),
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
    commitment TEXT NOT NULL CHECK (commitment IN ('none', 'maybe', 'pilot')),
    price_reaction TEXT NOT NULL CHECK (price_reaction IN ('positive', 'neutral', 'negative')),
    notes TEXT,
    key_insights JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals table (single row)
CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY DEFAULT 1,
    target_interviews INTEGER DEFAULT 10,
    target_high_scores INTEGER DEFAULT 5,
    target_pilots INTEGER DEFAULT 3,
    target_setup_time INTEGER DEFAULT 180,
    price_point INTEGER DEFAULT 180,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default goals row
INSERT INTO goals (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Enable Row Level Security (RLS)
-- For now, we allow all authenticated users to read/write (team collaboration)
-- ============================================================================

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (no auth required, public access)
-- This is fine for a small team dashboard
CREATE POLICY "Allow all access to tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to teachers" ON teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to interviews" ON interviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to goals" ON goals FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- Enable Realtime
-- This allows both co-founders to see changes instantly
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE teachers;
ALTER PUBLICATION supabase_realtime ADD TABLE interviews;
ALTER PUBLICATION supabase_realtime ADD TABLE goals;

-- ============================================================================
-- Indexes for better performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_tasks_week_id ON tasks(week_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_teachers_status ON teachers(status);
CREATE INDEX IF NOT EXISTS idx_teachers_school ON teachers(school);
CREATE INDEX IF NOT EXISTS idx_teachers_next_follow_up ON teachers(next_follow_up_date);
CREATE INDEX IF NOT EXISTS idx_teachers_last_contact ON teachers(last_contact_date);
CREATE INDEX IF NOT EXISTS idx_interviews_teacher_id ON interviews(teacher_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews(date);
