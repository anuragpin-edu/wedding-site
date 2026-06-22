-- ============================================================
-- Registry v2 — planning/purchased states, contact info,
-- party linking, and 6-hour auto-release of unconfirmed holds.
-- Run this in the Supabase SQL Editor (safe to run once).
-- ============================================================

-- --- registry_items: richer status + a hold expiry timestamp ---
ALTER TABLE registry_items
  DROP CONSTRAINT IF EXISTS registry_items_status_check;

ALTER TABLE registry_items
  ADD COLUMN IF NOT EXISTS held_until TIMESTAMPTZ;

-- Normalize any legacy 'claimed' values before re-adding the constraint.
UPDATE registry_items SET status = 'purchased' WHERE status = 'claimed';

ALTER TABLE registry_items
  ADD CONSTRAINT registry_items_status_check
  CHECK (status IN ('available', 'planning', 'purchased'));

-- --- registry_claims: contact info, claim status, party link ---
ALTER TABLE registry_claims
  ADD COLUMN IF NOT EXISTS claimer_email TEXT,
  ADD COLUMN IF NOT EXISTS claimer_phone TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'planning',
  ADD COLUMN IF NOT EXISTS party_id UUID REFERENCES parties(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS released BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE registry_claims
  DROP CONSTRAINT IF EXISTS registry_claims_status_check;
ALTER TABLE registry_claims
  ADD CONSTRAINT registry_claims_status_check
  CHECK (status IN ('planning', 'purchased'));

-- --- Privacy: claims now hold contact info, so lock the table down ---
-- Remove the old public policies; all claim reads/writes now go through
-- server-side API routes using the service role (deny-by-default for anon).
DROP POLICY IF EXISTS "guests can claim items" ON registry_claims;
DROP POLICY IF EXISTS "claims are public" ON registry_claims;

-- registry_items keeps its public read policy (titles/prices/status are public).

-- ============================================================
-- Done.
-- ============================================================
