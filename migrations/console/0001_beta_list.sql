CREATE TABLE IF NOT EXISTS beta_signups (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE, city TEXT CHECK (city IS NULL OR length(city) <= 80), heard TEXT CHECK (heard IS NULL OR heard IN ('friend', 'instagram', 'whatsapp', 'search', 'other')), created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS beta_rate_limits (bucket TEXT PRIMARY KEY, window_start INTEGER NOT NULL, hits INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS beta_rate_limits_window ON beta_rate_limits (window_start);
