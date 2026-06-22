-- ============================================================
-- RSVP self-registration — parties are created by guests themselves
-- via one unified link, identified by the primary's email + mobile.
-- Run this in the Supabase SQL Editor (safe to run once).
-- ============================================================

-- Contact identity for a party (the primary guest's email + mobile).
-- Stored normalized (email lowercased, phone digits-only) so lookups and
-- dedupe are reliable. invite_code stays as an internal edit token.
ALTER TABLE parties
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- One party per email+phone pair — guarantees self-registration can't create
-- duplicates for the same person.
CREATE UNIQUE INDEX IF NOT EXISTS parties_contact_unique
  ON parties (contact_email, contact_phone)
  WHERE contact_email IS NOT NULL AND contact_phone IS NOT NULL;

-- ============================================================
-- Done.
-- ============================================================
