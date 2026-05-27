-- Apps table
CREATE TABLE IF NOT EXISTS apps (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    url TEXT NOT NULL,
    image TEXT,
    views INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    url TEXT NOT NULL,
    author_name TEXT,
    author_email TEXT,
    status TEXT DEFAULT 'pending',
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status);
CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category);
CREATE INDEX IF NOT EXISTS idx_apps_views ON apps(views DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
