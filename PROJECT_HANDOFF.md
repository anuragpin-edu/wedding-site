# PROJECT_HANDOFF.md

> Complete handoff for the **Anurag & Thanmai wedding website**. Written for an AI coding tool picking this up cold. Everything below was verified against the actual codebase, `package.json`, `CLAUDE.md`, the SQL files in `supabase/`, and `git log` — not guessed.
>
> Last updated against branch `post-merge-polish` @ commit `2fcbb04`.

---

## 1. Project overview

A **custom wedding website** for **Anurag & Thanmai**, getting married **August 22, 2026** in Cumming, Georgia (USA). ~200 guests.

- **Live domain:** https://www.bunnymetanu.com (registered + DNS via Cloudflare, hosted on Vercel; apex `bunnymetanu.com` 308-redirects to `www`).
- **Purpose:** one place for guests to see the celebrations, RSVP, browse/claim a gift registry, read updates, and (optionally) get push notifications. Plus a private admin dashboard for the couple.

### Feature list & status

| Feature | Status |
|---|---|
| Home page (hero, names, live countdown, events teaser) | ✅ Done |
| Events page (3 events: details, time + timezone, map link, dress code, add-to-calendar, per-event artwork) | ✅ Done |
| RSVP — **self-registration** (one unified link, add party members, per-event attendance, dietary notes, edit/return) | ✅ Done |
| Gift Registry (catalog, claim flow with "planning" 6h hold vs "purchased", order ID, party linking) | ✅ Done (hidden in prod via flag — see §6) |
| Updates / Announcements page (always-on channel) | ✅ Done |
| Web Push notifications (VAPID, iOS Add-to-Home-Screen flow, platform branching) | ✅ Done (built; real-device iOS/Android verification still recommended) |
| PWA (manifest, service worker, installable, bunny app icon) | ✅ Done |
| Admin dashboard (Supabase Auth, RSVP views + CSV export, registry management, announcements + push, profile, password reset) | ✅ Done |
| Keep-alive cron (GitHub Action, daily, prevents Supabase free-tier pause) | ✅ Done + verified |
| Security pass (RLS audit, rate limiting, Turnstile hooks, security headers) | ✅ Done (Turnstile dormant until keys added) |
| Deploy to Vercel + custom domain | ✅ Done (live) |
| **Media: real photos via Cloudflare R2 + videos via Cloudflare Stream** | ❌ **Not started (Phase 7)** — currently gradient/placeholder banners + "No image yet" |
| Cloudflare Turnstile spam protection (activate with real keys) | ⏳ Built but **not activated** (no keys yet) |
| Extra sections: Our Story, Travel & Stay, FAQ | ❌ Not started (optional, noted in CLAUDE.md media plan) |

---

## 2. Tech stack & versions

Exact versions from `package.json`:

**Runtime dependencies**
- `next` **16.2.9** — App Router + Turbopack. Framework, SSR, routing, API routes, server actions.
- `react` **19.2.4** / `react-dom` **19.2.4**
- `@supabase/supabase-js` **^2.108.1** — DB + Auth client.
- `@supabase/ssr` **^0.12.0** — cookie-based Supabase auth for SSR / server components / proxy.
- `web-push` **^3.6.7** — server-side Web Push sending (VAPID).

**Dev dependencies**
- `typescript` **^5**
- `tailwindcss` **^4** + `@tailwindcss/postcss` **^4** — styling (Tailwind v4, configured via `@import "tailwindcss"` and `@theme` in `globals.css`; **no `tailwind.config.js`**).
- `sharp` **^0.35.2** — used **only** by `scripts/generate-icons.mjs` to render the bunny brand mark / favicon / OG image PNGs at build-authoring time (not at runtime).
- `eslint` **^9** + `eslint-config-next` **16.2.9**
- `@types/*` for node/react/react-dom/web-push.

**Node:** developed on Node v24. **Package manager:** npm.

### Why these (from CLAUDE.md)
- **Next.js + TS + Tailwind + Vercel:** zero-config Git deploys, simplest robust stack.
- **Supabase:** managed Postgres + Auth + RLS on every table.
- **Cloudflare R2** (planned) for photos via a custom Next `<Image>` loader so optimization stays off Vercel's transform limit. **Cloudflare Stream** (planned) for video. **Photos/videos must NEVER be stored in the database.**
- **Web Push via self-generated VAPID keys** — no third-party messaging service, no per-message cost. **No email (no Resend) and no programmatic SMS** by design.
- **Cloudflare Turnstile** (free) for spam protection on RSVP + registry-claim.

> ⚠️ Note for the migrating tool: the original brief mentioned **Mux** as a video option, but the project **chose Cloudflare Stream**. There is **no Mux integration** anywhere.

---

## 3. Architecture

### Directory structure (key paths)
```
.
├── CLAUDE.md                      # Project bible: stack, schema, conventions, "never do" rules
├── PROJECT_HANDOFF.md            # (this file)
├── next.config.ts                # Security headers (HSTS, X-Frame-Options, etc.)
├── package.json
├── .env.example                  # Template for all env vars (committed; .env.local is gitignored)
├── .github/workflows/keep-alive.yml   # Daily cron pinging Supabase keep_alive table
├── public/
│   ├── sw.js                     # Service worker: handles web-push + notification click
│   └── icons/                    # PWA icons (bunny mark): 192/512/maskable/apple-touch
├── scripts/
│   └── generate-icons.mjs        # Renders bunny brand mark -> favicon/app icons/OG image (via sharp)
│   └── seed-*.mjs                # Local-only DB seeders (gitignored)
├── supabase/
│   ├── schema.sql                # CANONICAL full schema + RLS (run this for a fresh DB)
│   ├── registry_v2.sql           # Migration: planning/purchased states, contact, party link, held_until
│   ├── registry_v3.sql           # Migration: order_id column
│   ├── rsvp_self_registration.sql# Migration: parties.contact_email/phone + unique index
│   ├── settings.sql              # Migration: settings key/value table
│   └── keep_alive.sql            # Migration: singleton keep_alive + anon UPDATE policy
└── src/
    ├── app/
    │   ├── layout.tsx            # Root layout: fonts (Cormorant Garamond + Geist), metadata, OG, manifest, SW register
    │   ├── globals.css           # Tailwind v4 theme tokens, palette, fonts, pattern/animation CSS
    │   ├── manifest.ts           # PWA web app manifest (-> /manifest.webmanifest)
    │   ├── icon.png / apple-icon.png / opengraph-image.png / twitter-image.png  # brand assets (auto-detected by Next)
    │   ├── (public)/             # Route group: public site (shares Nav + Footer + patterned bg)
    │   │   ├── layout.tsx        # Public chrome: Nav, <main> (fade-in), Footer, site-wide pattern
    │   │   ├── page.tsx          # HOME: hero, countdown, celebrations teaser
    │   │   ├── events/page.tsx   # EVENTS: full event cards
    │   │   ├── rsvp/page.tsx     # RSVP: renders RsvpClient
    │   │   ├── registry/page.tsx # REGISTRY: catalog (or "coming soon" when REGISTRY_ENABLED=false)
    │   │   └── updates/page.tsx  # UPDATES: published announcements + EnableUpdates
    │   ├── admin/
    │   │   ├── login/ forgot/ reset/   # Auth pages (OUTSIDE the dashboard auth guard)
    │   │   └── (dashboard)/      # Route group: everything here is auth-guarded
    │   │       ├── layout.tsx    # Guard (getAdminUser) + admin nav + sign-out
    │   │       ├── page.tsx      # Overview (counts)
    │   │       ├── rsvps/page.tsx + rsvps/export/route.ts  # RSVP list + CSV export
    │   │       ├── registry/page.tsx + registry/actions.ts + registry/[id]/page.tsx  # registry mgmt
    │   │       ├── announcements/page.tsx + actions.ts     # post/publish + push
    │   │       └── profile/page.tsx                        # name + password
    │   └── api/
    │       ├── rsvp/submit/route.ts   # Create/update RSVP (dedupe by email+phone)
    │       ├── rsvp/lookup/route.ts   # Find RSVP by email OR phone (cross-device)
    │       ├── rsvp/load/route.ts     # Load RSVP by edit token (same-browser return)
    │       ├── registry/claim/route.ts# Claim an item (planning/purchased, atomic grab)
    │       └── push/subscribe + unsubscribe/route.ts  # store/remove push subscriptions
    ├── proxy.ts                  # Next 16 "proxy" (was middleware.ts): refresh auth session + guard /admin
    ├── components/               # Shared React components (see below)
    ├── lib/                      # Server/client helpers (see below)
    └── types/database.ts         # TypeScript types mirroring the DB schema
```

### Key `lib/` modules
- `lib/supabase/client.ts` — browser Supabase client (anon key).
- `lib/supabase/server.ts` — SSR Supabase client + `createAdminClient()` (cookie-aware).
- `lib/supabase/service.ts` — **service-role** client, **server-only**, bypasses RLS. Never import into a client component.
- `lib/supabase/middleware.ts` — `updateSession()` used by `proxy.ts` to refresh the auth cookie + redirect unauthenticated `/admin`.
- `lib/admin.ts` — `getAdminUser()` / `isAdminEmail()`; gates `/admin` to `ADMIN_EMAILS`.
- `lib/rsvp.ts` — `getPartyByToken()`, `findParty(email?, phone?)`, `normalizeEmail/Phone`.
- `lib/registry.ts` — `getRegistryItems()` (public view w/ effective status), `reconcileExpiredHolds()` (flips expired 6h holds back to available in the DB), `HOLD_HOURS = 6`.
- `lib/adminData.ts` — `getAllRsvps()` (for admin + CSV), `getRegistryAdmin()` (items + claim contact info, expiry-aware).
- `lib/settings.ts` — key/value settings get/set (e.g. `SHIPPING_ADDRESS`).
- `lib/features.ts` — `registryEnabled()` feature flag.
- `lib/getEvents.ts` + `lib/eventFormat.ts` — fetch events + client-safe date/time/timezone formatters + `mapsLink`.
- `lib/calendar.ts` — Google Calendar URL + `.ics` generation (US Eastern).
- `lib/rateLimit.ts` — in-memory per-IP limiter.
- `lib/turnstile.ts` — Cloudflare Turnstile server verification (gracefully optional).
- `lib/push.ts` — `sendPushToAll()` (web-push, prunes dead subs). `lib/pushClient.ts` — browser push helpers + iOS/standalone detection.

### Key `components/`
`Nav`, `Footer`, `Countdown`, `EventCard`, `EventArt` (per-event line-art emblems), `AddToCalendar`, `RsvpClient` (the whole RSVP UI), `RegistryGrid` (catalog + claim UI), `EnableUpdates` (push opt-in + iOS A2HS flow), `ServiceWorkerRegister`, `Turnstile`, `CopyButton`, `ComingSoon`, `icons.tsx` (inline SVG icons), `BunnyMark` (**currently unused** — bunny removed from header; file + `bunny-hop` CSS remain), and `admin/` (`LoginForm`, `ForgotForm`, `ResetForm`, `ProfileForm`, `ShippingAddressEditor`).

### Routing (every route)
**Public:** `/` (home), `/events`, `/rsvp`, `/registry`, `/updates`.
**Admin:** `/admin/login`, `/admin/forgot`, `/admin/reset`, `/admin` (overview), `/admin/rsvps`, `/admin/rsvps/export` (CSV download), `/admin/registry`, `/admin/registry/[id]` (edit item), `/admin/announcements`, `/admin/profile`.
**API:** `/api/rsvp/submit`, `/api/rsvp/lookup`, `/api/rsvp/load`, `/api/registry/claim`, `/api/push/subscribe`, `/api/push/unsubscribe`.
**Generated:** `/manifest.webmanifest`, `/icon.png`, `/apple-icon.png`, `/opengraph-image.png`, `/twitter-image.png`, `/sw.js` (static).

### Data flow
- **Frontend → Supabase:**
  - **Public-read tables** (`events`, `registry_items`, `settings`, published `announcements`) can be read with the anon client, but in practice are read **server-side via the service client** inside server components for one consistent path.
  - **Sensitive guest tables** (`parties`, `guests`, `event_attendance`, `registry_claims`, `push_subscriptions`) are **deny-by-default under RLS**. The browser **never** touches them directly. All reads/writes go through **Next.js API routes / server actions** using the **service-role** client, after the route authorizes the request (e.g. verifies the RSVP edit token, or that the email+phone matches).
  - **Admin** writes go through **server actions** (`registry/actions.ts`, `announcements/actions.ts`) guarded by `getAdminUser()`.
- **Auth:** Supabase Auth (email+password). `proxy.ts` refreshes the session cookie on every request and redirects unauthenticated `/admin/*` (except login/forgot/reset) to login. The `(dashboard)` layout re-checks the email allowlist (defense in depth).
- **Web Push:** browser subscribes via `EnableUpdates` → POST `/api/push/subscribe` (stored via service role). Admin posts an announcement with "send push" → server action calls `sendPushToAll()` (`web-push` + VAPID) → `public/sw.js` shows the notification.
- **R2 / Stream:** **not wired yet** (Phase 7). No image loader, no Stream embed. Event banners are CSS gradients; registry items show "No image yet".

---

## 4. Database

Postgres on Supabase. **`supabase/schema.sql` is the canonical, current schema** (it already incorporates every migration below). RLS is enabled on **every** table.

### Tables (columns, types, constraints, relationships)

**`parties`** — an RSVP group (self-registered).
- `id uuid PK default gen_random_uuid()`
- `invite_code text UNIQUE NOT NULL` — internal **edit token** kept in the guest's browser (localStorage `rsvp:current`); not mailed out.
- `display_name text NOT NULL`
- `contact_email text` — normalized lowercase
- `contact_phone text` — normalized digits-only
- `created_at timestamptz default now()`
- **Unique index** `parties_contact_unique` on `(contact_email, contact_phone)` WHERE both not null → one party per person (resubmitting updates rather than duplicates).

**`guests`** — people within a party.
- `id uuid PK`, `party_id uuid NOT NULL REFERENCES parties(id) ON DELETE CASCADE`
- `full_name text NOT NULL`, `is_primary boolean default false`, `dietary_notes text`, `created_at timestamptz`

**`events`** — the 3 celebrations (seeded).
- `id uuid PK`, `name text NOT NULL`, `date date NOT NULL`, `start_time time NOT NULL`, `venue text NOT NULL`, `address text NOT NULL`, `description text`, `dress_code text`, `display_order int NOT NULL`
- Seeded: Haldi (Aug 21, 07:30, Farmhouse, Yellow); Sangeeth & Mehendi (Aug 21, 19:00, Indo-Western); Wedding (Aug 22, 11:00, Banjara Banquets, Indian Traditional).

**`event_attendance`** — per-guest per-event.
- `guest_id uuid REFERENCES guests ON DELETE CASCADE`, `event_id uuid REFERENCES events ON DELETE CASCADE`, `attending boolean NOT NULL`, **PK `(guest_id, event_id)`**.

**`registry_items`** — gift catalog.
- `id uuid PK`, `title text NOT NULL`, `description text`, `image_url text`, `price numeric(10,2)`, `store_url text NOT NULL`
- `status text NOT NULL default 'available' CHECK (status IN ('available','planning','purchased'))`
- `held_until timestamptz` — when a `planning` soft hold expires (6h); past it the item is effectively free.
- `display_order int`, `created_at timestamptz`

**`registry_claims`** — who claimed what (contact info is admin-only, never sent to browser).
- `id uuid PK`, `registry_item_id uuid REFERENCES registry_items ON DELETE CASCADE`
- `claimer_name text NOT NULL`, `claimer_email text`, `claimer_phone text`, `claimer_message text`
- `order_id text` — required (app-level) when `status='purchased'`
- `status text NOT NULL default 'planning' CHECK (status IN ('planning','purchased'))`
- `party_id uuid REFERENCES parties ON DELETE SET NULL` — silent link if claimer RSVP'd on that browser
- `released boolean NOT NULL default false` — set true when a hold expires or is released
- `claimed_at timestamptz`

**`announcements`** — `id uuid PK`, `title text NOT NULL`, `body text NOT NULL`, `published boolean default false`, `created_at timestamptz`.

**`push_subscriptions`** — `id uuid PK`, `endpoint text UNIQUE NOT NULL`, `p256dh text NOT NULL`, `auth text NOT NULL`, `user_agent text`, `created_at timestamptz`.

**`settings`** — `key text PK`, `value text`, `updated_at timestamptz`. (Currently used for `shipping_address`.)

**`keep_alive`** — `id smallint PK default 1 CHECK (id = 1)`, `pinged_at timestamptz`. **Singleton** (one row, never grows); updated daily by the GitHub Action.

### RLS policies (table by table)
RLS is **enabled on all tables**. Policies:
- **`parties`, `guests`, `event_attendance`, `registry_claims`** — **NO policies = deny-by-default for anon.** All access via server-side service role after app-level authorization. (registry_claims holds contact info, so it's fully locked.)
- **`events`** — `SELECT USING (true)` (public read).
- **`registry_items`** — `SELECT USING (true)` (public read; admin writes via service role).
- **`announcements`** — `SELECT USING (published = true)` (only published are public).
- **`push_subscriptions`** — `INSERT WITH CHECK (true)` (anyone may subscribe); `SELECT USING (false)` (no guest reads).
- **`keep_alive`** — `SELECT USING (true)` and `UPDATE USING (true) WITH CHECK (true)` (the cron updates the single row with the anon key — never the service role).
- **`settings`** — `SELECT USING (true)` (public read; admin writes via service role).

> Behavioral RLS audit performed (Phase 10): with the anon key, the four sensitive tables return **0 rows** and reject writes (401); only the public-read tables return data. Confirmed against the live DB.

### Migration / SQL files
Run **once each** in the Supabase SQL Editor (in this order, OR just run `schema.sql` for a brand-new DB which already includes all of them):
1. `schema.sql` — full schema + seed + RLS (the source of truth).
2. `registry_v2.sql` — added planning/purchased states + `held_until` to `registry_items`; added `claimer_email/phone/status/party_id/released` to `registry_claims`; dropped old public claim policies (locked the table).
3. `registry_v3.sql` — added `registry_claims.order_id`.
4. `rsvp_self_registration.sql` — added `parties.contact_email/contact_phone` + unique index (the pivot to self-registration).
5. `settings.sql` — created `settings` table + public-read policy.
6. `keep_alive.sql` — recreated `keep_alive` as a singleton + anon UPDATE/SELECT policies.

**Planned but not yet created in the schema:** none outstanding — the schema is current. (Media is handled outside the DB by design; no DB changes needed for Phase 7 unless a `gallery`/`media` table is later desired.)

---

## 5. Environment variables

From `.env.example`. **Names only — never commit values.** `.env.local` is gitignored. Anything prefixed `NEXT_PUBLIC_` ships to the browser; everything else is server-only.

| Variable | Public? | Purpose | Service / where to get |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon/publishable key | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Service-role key (bypasses RLS, server-only) | Supabase → Settings → API |
| `ADMIN_EMAILS` | Secret | Comma-separated emails allowed into `/admin` | You define it |
| `REGISTRY_ENABLED` | Secret | Feature flag; set to `false` to hide the public registry (set `false` in **Vercel Production**) | You define it |
| `CLOUDFLARE_R2_ACCOUNT_ID` | Secret | R2 account (Phase 7) | Cloudflare → R2 |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | Secret | R2 access key (Phase 7) | Cloudflare → R2 API tokens |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Secret | R2 secret (Phase 7) | Cloudflare → R2 API tokens |
| `CLOUDFLARE_R2_BUCKET_NAME` | Secret | R2 bucket name (Phase 7) | Cloudflare → R2 |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | Public | Public CDN URL for the R2 bucket (Phase 7) | Cloudflare → R2 public bucket |
| `CLOUDFLARE_STREAM_TOKEN` | Secret | Cloudflare Stream API token (Phase 7) | Cloudflare → Stream |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public | VAPID public key for web push | `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | **Secret** | VAPID private key | same command |
| `VAPID_SUBJECT` | Secret | Contact for push services (`mailto:` or `https:`) | You define it |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public | Cloudflare Turnstile site key (Phase 10; optional) | Cloudflare → Turnstile |
| `TURNSTILE_SECRET_KEY` | Secret | Turnstile secret key | Cloudflare → Turnstile |

**Currently set (in `.env.local` locally and in Vercel):** the Supabase trio, `ADMIN_EMAILS`, the VAPID trio. **`REGISTRY_ENABLED=false`** is set in **Vercel Production only** (registry stays visible on localhost/preview). R2/Stream/Turnstile vars are **empty/unset** (their features are gracefully optional or not built yet).

---

## 6. External services & integrations

| Service | Used for | Status |
|---|---|---|
| **Supabase** | Postgres DB, Auth (admin), RLS | ✅ Live. Schema + all migrations applied. One admin user created in Supabase Auth (the couple's email). **Auth → URL Configuration:** add production redirect URL `https://www.bunnymetanu.com/admin/reset` (and `localhost:3000/admin/reset` for dev) so password reset works. Built-in recovery email is rate-limited on free tier (fine for one admin). |
| **Vercel** | Hosting (prod = `master` → bunnymetanu.com; preview = branches) | ✅ Live. GitHub-connected, auto-deploys. Env vars set. Custom domain connected. Per-environment env vars used for `REGISTRY_ENABLED`. |
| **Cloudflare (DNS/domain)** | `bunnymetanu.com` registration + DNS | ✅ Done (domain bought through Cloudflare; pointed at Vercel). |
| **Cloudflare R2** | Photo storage (Phase 7) | ❌ Not set up. No code wired. |
| **Cloudflare Stream** | Video hosting (Phase 7) | ❌ Not set up. No code wired. (This is the chosen video host — **not Mux**.) |
| **Cloudflare Turnstile** | Spam protection on RSVP + registry-claim | ⏳ **Built but dormant.** Code (`lib/turnstile.ts`, `components/Turnstile.tsx`) only renders the widget + verifies tokens **when the Turnstile keys are present**; with no keys it's skipped so forms work. Add the two keys (Cloudflare → Turnstile) to activate. |
| **GitHub Actions** | Keep-alive cron | ✅ `.github/workflows/keep-alive.yml` runs daily 06:17 UTC + manual dispatch. Repo secrets `SUPABASE_URL` + `SUPABASE_ANON_KEY` added. Manually triggered + verified green. |
| **Web Push (VAPID)** | Notifications | ✅ Built. VAPID keys generated + in env. Desktop verified. iOS requires Add-to-Home-Screen (handled in `EnableUpdates`); real-device iOS/Android verification on HTTPS still recommended. **No email/SMS service by design.** |

---

## 7. Current state & what's done

### Git history / phases
Built in phases (each merged via PR to `master`):
- **Phase 1** Scaffold (Next + TS + Tailwind + Supabase clients + CLAUDE.md).
- **Phase 2** Database schema + RLS.
- **Phase 3** Core pages (home/hero, events, shared layout).
- **Phase 4 → RSVP rework** Originally invite-code RSVP; **pivoted to self-registration** (one unified link, identity = email+mobile, dedupe, cross-device lookup).
- **Phase 5** Gift Registry (catalog + claim flow; planning/purchased; order ID; 6h hold).
- **Phase 6** Admin dashboard (Supabase Auth, RSVP views + CSV export, registry mgmt, announcements, profile, password reset).
- **Phase 8** PWA + Web Push (manifest, service worker, VAPID, iOS flow, Updates page).
- **Phase 9** Keep-alive cron.
- **Phase 10** Security pass (RLS audit, rate limiting, Turnstile hooks, security headers, `middleware.ts`→`proxy.ts`).
- **Phase 11** Deploy (Vercel + bunnymetanu.com) — **done, live.**
- **Post-merge polish** (current branch `post-merge-polish`, open PR): registry hidden behind `REGISTRY_ENABLED`, bunny brand mark / favicon / OG image, `AT - <Page>` tab titles, compact footer with contact emails, per-event artwork, dress-code/time updates, centered event cards, seamless site-wide South-Indian pattern background, real 6h-hold DB reconciliation, admin add/edit/delete confirmations, and assorted UX fixes.

**Most recent working state:** `master` is what's deployed to production. The **`post-merge-polish` branch is ahead of `master`** with the polish batch above and has an **open PR that must be merged to push these to production.** The branch builds clean (`npm run build` passes) and the dev server runs.

### Half-finished / stubbed / known gaps
- **Media (Phase 7) is entirely unbuilt.** Event card banners are CSS gradients; registry shows "No image yet". No R2 image loader, no Stream embed, no gallery.
- **Turnstile is dormant** (no keys) — by design, forms work without it.
- **`components/BunnyMark.tsx` is unused** (bunny removed from header). The `bunny-hop` keyframes remain in `globals.css`. Safe to delete both if desired.
- **Homepage "Celebrations" teaser** — the couple flagged it as too small and want to redesign it (deferred).
- **TODO/notes in code:** the registry `order_id` is enforced at the app layer (not a DB constraint). No blocking TODOs.
- **Stray `1` file:** a Windows redirect occasionally created a junk file named `1` at the repo root; it's now gitignored (`/1`). If it reappears, delete it.

### Uncommitted local changes
At handoff time the working tree should be **clean** (everything committed to `post-merge-polish`). If `git status` shows `src/components/admin/ProfileForm.tsx` or `src/lib/getEvents.ts` as modified, those are already-committed files the editor/linter re-touched — diff them before acting; no pending feature work is sitting uncommitted.

---

## 8. What's next

In priority order:

1. **Merge the open `post-merge-polish` PR** → deploys all the recent polish + the real 6h-hold reconciliation + admin confirmations to production.
2. **Phase 7 — Media** (the big remaining build):
   - Create a Cloudflare **R2** bucket; add a **custom Next `<Image>` loader** so image optimization runs on Cloudflare's CDN (keeps off Vercel's transform limit). Fill the R2 env vars.
   - Wire **Cloudflare Stream** for 2–3 short muted autoplay loops (lazy-loaded via IntersectionObserver) + a tap-to-play gallery. Fill `CLOUDFLARE_STREAM_TOKEN`.
   - Home page media plan (from CLAUDE.md): **photo hero** with dark scrim → events → ambient video bands → photo/video gallery. Replace gradient banners + "No image yet" with real media.
3. **Activate Turnstile** — add the two Turnstile keys in Vercel; the existing hooks turn it on automatically.
4. **Redesign the homepage Celebrations teaser** (couple flagged it as too small).
5. **Real-device push verification** — iPhone (installed to Home Screen) + Android/desktop on the live HTTPS domain.
6. **Optional extra sections** — Our Story / timeline, Travel & Stay (hotels, ATL airport, parking), FAQ.

### Known issues / pending decisions
- **Intermittent Supabase connectivity** from the dev machine (`ConnectTimeoutError` to `*.supabase.co:443`) — network/DNS, **not a code bug**; `getEvents()` already degrades gracefully (returns `[]`). Often a VPN/flaky-DNS symptom.
- **Shared database** across dev/preview/prod (all point at the same Supabase project). A **separate dev Supabase project** is a noted future option (so test data never touches prod) — not done yet.
- **Font** is deliberately back on **Cormorant Garamond** (the couple rejected several alternatives). Do not change fonts without asking.

---

## 9. Conventions & guardrails

**Conventions**
- TypeScript everywhere; types in `src/types/database.ts` mirror the DB — keep in sync when the schema changes.
- Server-only modules use `import "server-only"`. The service-role client lives in `lib/supabase/service.ts` and must **never** be imported into a client component.
- Public site under the `(public)` route group (shares `Nav`/`Footer`/pattern); admin under `admin/(dashboard)` (auth-guarded). Auth pages (`login/forgot/reset`) sit **outside** the guard.
- Guest data writes go through **API routes / server actions** with the service role **after** authorizing (RSVP edit token, or exact email+phone, or admin session). RLS is the backstop, not the only check.
- Tailwind v4 with theme tokens in `globals.css` (palette: maroon `#8c2b2b`, marigold/gold, sage, cream; display font = Cormorant Garamond via `--font-display`, body = Geist). No `tailwind.config.js`.
- Inline SVG icons in `components/icons.tsx` (line style, `currentColor`).
- Commits are phase/feature scoped; PR per branch; `master` = production.

**"Never do" rules (from CLAUDE.md)**
- **Never** store photos/videos in the database — use R2 / Cloudflare Stream.
- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` to the browser, and never put any secret behind `NEXT_PUBLIC_`. Only the anon key may be public.
- **Never** commit secrets / `.env.local`.
- **Never** build payment processing — the registry links out to external stores only.
- **Never** integrate email (no Resend) or programmatic SMS — notifications are web push + the on-site Updates page only (the couple sends WhatsApp/SMS manually).
- **Never** assume iOS web push works in a Safari tab — it requires **Add to Home Screen / standalone mode** (detect `window.navigator.standalone` / `display-mode: standalone`; show A2HS instructions otherwise).
- **Never** skip RLS on a table holding guest data.
- **Never** expose guest personal data on any public/unauthenticated route (no public name-search of guests — lookup requires exact email/phone).

---

## 10. How to run locally

From a fresh machine:

1. **Prerequisites:** Node.js (v20+; developed on v24) and npm. `git`.
2. **Clone:**
   ```bash
   git clone https://github.com/anuragpin-edu/wedding-site.git
   cd wedding-site
   ```
3. **Install:**
   ```bash
   npm install
   ```
4. **Environment:** copy the template and fill in real values:
   ```bash
   cp .env.example .env.local
   ```
   At minimum set the **Supabase trio** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`), `ADMIN_EMAILS`, and the **VAPID trio** (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`) — generate VAPID with `npx web-push generate-vapid-keys`. Leave R2/Stream/Turnstile empty (those features are optional/not built). Leave `REGISTRY_ENABLED` empty locally so the registry is visible.
5. **Database (only if standing up a NEW Supabase project):** open the Supabase SQL Editor and run `supabase/schema.sql` (it includes all migrations + seeds the 3 events). Then create one admin user under **Authentication → Users** (email matching `ADMIN_EMAILS`, "Auto Confirm" on), and add `http://localhost:3000/admin/reset` under **Authentication → URL Configuration → Redirect URLs**.
6. **Run:**
   ```bash
   npm run dev
   ```
   → http://localhost:3000 (public site) and http://localhost:3000/admin/login (admin).
7. **Build / lint:** `npm run build`, `npm run lint`.

**Gotcha:** Next.js fetches Google Fonts at dev/build time — if a font renders as a heavy fallback, stop the dev server, delete `.next/`, and restart (clears the stale font cache). Same fix for occasional Turbopack/CSS oddities after branch switches.

---

*End of handoff. The single most important next build is **Phase 7 (Media)**; the single most important "don't break" is **RLS + never exposing the service-role key or guest PII**.*
