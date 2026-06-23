-- ============================================================
-- Settings — a small key/value table for site-wide values the admin can edit
-- (e.g. the registry "ship gifts to" address). Public-read so the registry
-- page can show it; only the admin writes, via the service role.
-- Run this in the Supabase SQL Editor (safe to run once).
-- ============================================================

CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (values here are non-sensitive, e.g. shipping address).
CREATE POLICY "settings are public"
  ON settings FOR SELECT
  USING (true);

-- No anon writes — the admin updates settings through server code (service role).

-- ============================================================
-- Done.
-- ============================================================
