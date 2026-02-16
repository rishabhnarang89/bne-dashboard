-- Knowledge Hub Tables

-- Cards (Categories/Buckets)
CREATE TABLE IF NOT EXISTS knowledge_cards (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'Folder',
    color TEXT DEFAULT 'blue',
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Items (Links, Files, Notes)
CREATE TABLE IF NOT EXISTS knowledge_items (
    id TEXT PRIMARY KEY,
    card_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('link', 'file', 'note', 'google_drive')),
    title TEXT NOT NULL,
    url TEXT,
    content TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (card_id) REFERENCES knowledge_cards(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_items_card_id ON knowledge_items(card_id);
