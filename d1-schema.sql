-- ============================================================================
-- BNE Dashboard - Cloudflare D1 Schema
-- SQLite-compatible schema for Cloudflare D1 database
-- ============================================================================

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    notes TEXT,
    week_id INTEGER NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    due_date TEXT,
    completed INTEGER DEFAULT 0,
    completed_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    is_default INTEGER DEFAULT 0,
    subtasks TEXT DEFAULT '[]',
    linked_interview_id INTEGER,
    assignee TEXT CHECK (assignee IN ('rishabh', 'tung', 'both'))
);

-- Teachers table (CRM)
CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    designation TEXT,
    department TEXT,
    school TEXT NOT NULL,
    school_type TEXT NOT NULL CHECK (school_type IN ('Gymnasium', 'Realschule', 'Gesamtschule', 'Grundschule', 'Other')),
    email TEXT,
    linkedin_url TEXT,
    request_sent_date TEXT,
    status TEXT NOT NULL CHECK (status IN ('identified', 'request_sent', 'connected', 'scheduled', 'interviewed', 'follow_up')),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    -- Outreach tracking fields
    contact_method TEXT CHECK (contact_method IN ('linkedin', 'email', 'phone', 'in-person', 'other')),
    response_date TEXT,
    last_contact_date TEXT,
    next_follow_up_date TEXT,
    linkedin_message_sent INTEGER DEFAULT 0,
    email_sent INTEGER DEFAULT 0,
    phone_call_made INTEGER DEFAULT 0
);

-- Interviews table (linked to teachers)
CREATE TABLE IF NOT EXISTS interviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    scheduled_date TEXT,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    duration INTEGER,
    time_spent INTEGER,
    setup_time INTEGER NOT NULL DEFAULT 0,
    success TEXT NOT NULL CHECK (success IN ('yes', 'no')),
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
    commitment TEXT NOT NULL CHECK (commitment IN ('none', 'maybe', 'pilot')),
    price_reaction TEXT NOT NULL CHECK (price_reaction IN ('positive', 'neutral', 'negative')),
    notes TEXT,
    questions TEXT,
    key_insights TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- Goals table (single row)
CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY DEFAULT 1,
    target_interviews INTEGER DEFAULT 10,
    target_high_scores INTEGER DEFAULT 5,
    target_pilots INTEGER DEFAULT 3,
    target_setup_time INTEGER DEFAULT 180,
    price_point INTEGER DEFAULT 180,
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Insert default goals row
INSERT OR IGNORE INTO goals (id) VALUES (1);

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
