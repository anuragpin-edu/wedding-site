-- ============================================================
-- Wedding Site — Database Schema + RLS Policies
-- Run this entire file in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

-- Parties — created by guests themselves via the unified RSVP link.
-- Identified by the primary guest's email + mobile (stored normalized).
-- invite_code is an internal edit token kept in the guest's browser.
CREATE TABLE parties (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code   TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- One party per email+phone pair — prevents duplicate self-registrations.
CREATE UNIQUE INDEX parties_contact_unique
  ON parties (contact_email, contact_phone)
  WHERE contact_email IS NOT NULL AND contact_phone IS NOT NULL;

-- Individual people within a party
CREATE TABLE guests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id       UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  full_name      TEXT NOT NULL,
  is_primary     BOOLEAN DEFAULT false,
  dietary_notes  TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- The 3 wedding events
CREATE TABLE events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  date           DATE NOT NULL,
  start_time     TIME NOT NULL,
  venue          TEXT NOT NULL,
  address        TEXT NOT NULL,
  description    TEXT,
  dress_code     TEXT,
  display_order  INT NOT NULL
);

-- Per-guest, per-event attendance
CREATE TABLE event_attendance (
  guest_id   UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  attending  BOOLEAN NOT NULL,
  PRIMARY KEY (guest_id, event_id)
);

-- Gift registry items
-- status: 'available' | 'planning' (soft hold) | 'purchased' (permanent)
-- held_until: when a 'planning' hold expires (6h); past it, the item is free again
CREATE TABLE registry_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  description    TEXT,
  image_url      TEXT,
  price          NUMERIC(10, 2),
  store_url      TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'available'
                   CHECK (status IN ('available', 'planning', 'purchased')),
  held_until     TIMESTAMPTZ,
  display_order  INT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Registry claims — contact info is for the couple's reference only, never
-- sent to the browser. party_id links the claim to a party when the claimer
-- has already RSVP'd on that browser.
CREATE TABLE registry_claims (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registry_item_id  UUID NOT NULL REFERENCES registry_items(id) ON DELETE CASCADE,
  claimer_name      TEXT NOT NULL,
  claimer_email     TEXT,
  claimer_phone     TEXT,
  claimer_message   TEXT,
  order_id          TEXT, -- required when status = 'purchased'
  status            TEXT NOT NULL DEFAULT 'planning'
                      CHECK (status IN ('planning', 'purchased')),
  party_id          UUID REFERENCES parties(id) ON DELETE SET NULL,
  released          BOOLEAN NOT NULL DEFAULT false,
  claimed_at        TIMESTAMPTZ DEFAULT now()
);

-- Announcements posted from the admin dashboard
CREATE TABLE announcements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  published  BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Web push subscriptions (one per browser that opted in)
CREATE TABLE push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint    TEXT UNIQUE NOT NULL,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Settings — small key/value store for admin-editable site values (e.g. the
-- registry "ship gifts to" address). Public-read; admin writes via service role.
CREATE TABLE settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Keep-alive — single row updated daily by GitHub Actions (anon key) to
-- prevent the Supabase free project pausing for inactivity. The CHECK keeps
-- it to exactly one row so it never grows.
CREATE TABLE keep_alive (
  id        SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  pinged_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO keep_alive (id, pinged_at) VALUES (1, now());

-- ============================================================
-- SEED: The 3 events
-- ============================================================

INSERT INTO events (name, date, start_time, venue, address, dress_code, display_order) VALUES
  ('Haldi',               '2026-08-21', '07:30', 'Farmhouse',        '6695 Dawsonville Hwy, Dawsonville, GA',        'Yellow',      1),
  ('Sangeeth & Mehendi',  '2026-08-21', '20:00', 'Venue',            '4680 W Morton Rd, Johns Creek, GA 30022',      'Party wear',  2),
  ('Wedding',             '2026-08-22', '11:00', 'Banjara Banquets', '1656 Buford Hwy, Cumming, GA 30041',           'Traditional', 3);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE parties            ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests             ENABLE ROW LEVEL SECURITY;
ALTER TABLE events             ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance   ENABLE ROW LEVEL SECURITY;
ALTER TABLE registry_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE registry_claims    ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements      ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE keep_alive         ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings           ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- SENSITIVE GUEST TABLES — parties, guests, event_attendance
--
-- No anon (public) policies are defined for these tables. With RLS
-- enabled and no matching policy, the anon key is DENIED by default.
--
-- All guest access (look up party by invite code, add members, set
-- per-event attendance) flows through server-side Next.js API routes
-- that use the SERVICE ROLE key, which bypasses RLS. Those routes
-- verify the invite_code in application code before doing anything,
-- so a guest can only ever touch their own party's rows.
--
-- This keeps authorization logic in one place (the API route) instead
-- of spread across fragile SQL policies, while RLS guarantees that a
-- leaked anon key still cannot read or write any guest PII directly.
-- ------------------------------------------------------------
-- (intentionally no policies for parties / guests / event_attendance)

-- ------------------------------------------------------------
-- events: public read (anyone can see event details)
-- ------------------------------------------------------------
CREATE POLICY "events are public"
  ON events FOR SELECT
  USING (true);

-- ------------------------------------------------------------
-- registry_items: public read; admin manages via service role
-- ------------------------------------------------------------
CREATE POLICY "registry items are public"
  ON registry_items FOR SELECT
  USING (true);

-- ------------------------------------------------------------
-- registry_claims: deny-by-default. Claims hold contact info (email/phone),
-- so no anon access at all — all reads/writes go through server-side API
-- routes using the service role, which only ever send the claimer's name to
-- the browser.
-- ------------------------------------------------------------
-- (intentionally no policies for registry_claims)

-- ------------------------------------------------------------
-- announcements: only published ones are public
-- ------------------------------------------------------------
CREATE POLICY "published announcements are public"
  ON announcements FOR SELECT
  USING (published = true);

-- ------------------------------------------------------------
-- push_subscriptions: anyone can insert their own subscription
-- ------------------------------------------------------------
CREATE POLICY "anyone can subscribe to push"
  ON push_subscriptions FOR INSERT
  WITH CHECK (true);

-- guests cannot read other subscriptions
CREATE POLICY "no guest reads of push subscriptions"
  ON push_subscriptions FOR SELECT
  USING (false);

-- ------------------------------------------------------------
-- keep_alive: the daily GitHub Action updates the single row using the anon
-- key, so anon gets UPDATE + SELECT here (never the service role).
-- ------------------------------------------------------------
CREATE POLICY "anon can read keep_alive"
  ON keep_alive FOR SELECT
  USING (true);

CREATE POLICY "anon can update keep_alive"
  ON keep_alive FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------
-- settings: public read; admin writes via the service role only.
-- ------------------------------------------------------------
CREATE POLICY "settings are public"
  ON settings FOR SELECT
  USING (true);

-- ============================================================
-- Done. Verify by checking Tables in the Supabase dashboard.
-- ============================================================
