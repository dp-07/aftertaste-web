-- Beta list for theaftertaste.app (Cloudflare D1, SQLite).
-- Apply with: npx --yes wrangler@4.156.0 d1 migrations apply aftertaste-beta --remote
-- (and --local for the local copy used by `wrangler pages dev`). See docs/DEV-GUIDE.md.
-- In the D1 dashboard Console, paste console/0001_beta_list.sql instead: the same
-- statements without comments (the Console runs pasted SQL as one line, so "--"
-- comments swallow everything after them). Keep the two files in step.
--
-- Only what the form collects, plus the time of sign-up. No IP address, user
-- agent or any other request data is stored here.

CREATE TABLE IF NOT EXISTS beta_signups (
  id INTEGER PRIMARY KEY,
  -- Trimmed and lower-cased by the function; unique, so a repeat sign-up is a no-op.
  email TEXT NOT NULL UNIQUE,
  -- Optional, free text, at most 80 characters.
  city TEXT CHECK (city IS NULL OR length(city) <= 80),
  -- Optional, one of the form's fixed choices.
  heard TEXT CHECK (heard IS NULL OR heard IN ('friend', 'instagram', 'whatsapp', 'search', 'other')),
  -- ISO 8601, UTC, e.g. 2026-11-13T09:30:00.000Z
  created_at TEXT NOT NULL
);

-- Per-network rate limiting. `bucket` is SHA-256(secret salt, hour, IP): the
-- raw IP is never stored, the hash cannot be reversed without the secret, and
-- it changes every hour, so buckets cannot be linked across hours. Rows from
-- finished hours are deleted by the function on the next request.
CREATE TABLE IF NOT EXISTS beta_rate_limits (
  bucket TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  hits INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS beta_rate_limits_window ON beta_rate_limits (window_start);
