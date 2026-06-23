-- ============================================================
-- Keep-alive — a single-row table the daily GitHub Action updates
-- so the Supabase free project never pauses for inactivity.
-- The cron uses the ANON key, so anon needs UPDATE (+ SELECT) here.
-- Updating one fixed row means the table never grows.
-- Run this in the Supabase SQL Editor (safe to run once).
-- ============================================================

DROP TABLE IF EXISTS keep_alive;

CREATE TABLE keep_alive (
  id        SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- only ever one row
  pinged_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO keep_alive (id, pinged_at) VALUES (1, now());

ALTER TABLE keep_alive ENABLE ROW LEVEL SECURITY;

-- Anon may read and update the single ping row (harmless throwaway data).
CREATE POLICY "anon can read keep_alive"
  ON keep_alive FOR SELECT
  USING (true);

CREATE POLICY "anon can update keep_alive"
  ON keep_alive FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Done.
-- ============================================================
