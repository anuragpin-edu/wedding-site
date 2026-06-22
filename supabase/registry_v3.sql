-- ============================================================
-- Registry v3 — require an order ID + note to confirm a purchase,
-- so "Already bought" can't be committed by an accidental click.
-- Run this in the Supabase SQL Editor (safe to run once).
-- ============================================================

ALTER TABLE registry_claims
  ADD COLUMN IF NOT EXISTS order_id TEXT;

-- ============================================================
-- Done.
-- ============================================================
