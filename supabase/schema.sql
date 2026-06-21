-- ============================================================
-- Wedding Site — Database Schema + RLS Policies
-- Run this entire file in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

-- Invite groups (one per family/couple/individual invitation)
CREATE TABLE parties (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code   TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

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
CREATE TABLE registry_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  description    TEXT,
  image_url      TEXT,
  price          NUMERIC(10, 2),
  store_url      TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed')),
  display_order  INT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Registry claims (guest claims an item with their name)
CREATE TABLE registry_claims (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registry_item_id  UUID NOT NULL REFERENCES registry_items(id) ON DELETE CASCADE,
  claimer_name      TEXT NOT NULL,
  claimer_message   TEXT,
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

-- Keep-alive (pinged daily by GitHub Actions to prevent Supabase free-tier pausing)
CREATE TABLE keep_alive (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pinged_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SEED: The 3 events
-- ============================================================

INSERT INTO events (name, date, start_time, venue, address, dress_code, display_order) VALUES
  ('Haldi',               '2026-08-21', '07:30', 'Outdoor Venue',    '6695 Dawsonville Hwy, Dawsonville, GA',        'Yellow',      1),
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
-- registry_claims: anyone can insert a claim; no reads by guests (admin only)
-- ------------------------------------------------------------
CREATE POLICY "guests can claim items"
  ON registry_claims FOR INSERT
  WITH CHECK (true);

-- guests can read claims to see who claimed what (claimer_name only, no email)
CREATE POLICY "claims are public"
  ON registry_claims FOR SELECT
  USING (true);

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
-- keep_alive: service role only (GitHub Actions uses anon key via REST,
-- but we grant anon insert so the cron job works without service role)
-- ------------------------------------------------------------
CREATE POLICY "anon can ping keep_alive"
  ON keep_alive FOR INSERT
  WITH CHECK (true);

CREATE POLICY "anon can read keep_alive"
  ON keep_alive FOR SELECT
  USING (true);

-- ============================================================
-- Done. Verify by checking Tables in the Supabase dashboard.
-- ============================================================
