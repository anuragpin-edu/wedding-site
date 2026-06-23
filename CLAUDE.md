# Wedding Site — CLAUDE.md

Project context for Claude Code. Read this at the start of every session.

## The wedding
- **Couple:** Anurag & Thanmai
- **Domain:** bunnymetanu.com (not yet registered)
- **Guest count:** ~200
- **No per-party cap** on additional guests

### Events
| # | Name | Date | Time | Venue | Address | Dress |
|---|------|------|------|-------|---------|-------|
| 1 | Haldi | Aug 21, 2026 | 7:30 AM | (outdoor) | 6695 Dawsonville Hwy, Dawsonville, GA | Yellow |
| 2 | Sangeeth & Mehendi | Aug 21, 2026 | 8:00 PM | (venue) | 4680 W Morton Rd, Johns Creek, GA 30022 | Party wear |
| 3 | Wedding | Aug 22, 2026 | 11:00 AM | Banjara Banquets | 1656 Buford Hwy, Cumming, GA 30041 | Traditional |

---

## Stack
- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Hosting:** Vercel
- **Database + Auth:** Supabase (Postgres + RLS on every table)
- **File storage:** Cloudflare R2 with custom Next.js Image loader
- **Video:** Cloudflare Stream
- **Push notifications:** Web Push via VAPID keys (no third-party service)
- **Spam protection:** Cloudflare Turnstile on RSVP form
- **PWA:** web app manifest + service worker

## Project structure
```
src/
  app/              # Next.js App Router pages and layouts
    (public)/       # Public-facing pages (home, events, rsvp, registry, updates)
    admin/          # Admin dashboard — protected by Supabase Auth
    api/            # API route handlers
  lib/
    supabase/
      client.ts     # Browser Supabase client
      server.ts     # Server Supabase client + admin client
  components/       # Shared React components
  types/            # TypeScript types (mirrors DB schema)
```

## Database schema

```sql
parties         — invite groups (id, invite_code, display_name, created_at)
guests          — people in a party (id, party_id, full_name, is_primary, dietary_notes)
events          — the 3 wedding events
event_attendance — per-guest per-event attendance (guest_id, event_id, attending)
registry_items  — gift catalog (title, description, image_url, price, store_url, status, display_order)
registry_claims — who claimed what (registry_item_id, claimer_name, claimer_message)
announcements   — updates posted by admin (title, body, published)
push_subscriptions — opted-in browser push endpoints
keep_alive      — single-row table pinged daily by GitHub Actions
```

Full schema SQL is in `supabase/schema.sql` (created in Phase 2).

## Auth / RSVP model (self-registration)
- **One unified link for everyone:** `/rsvp` (no per-party invite codes sent out).
- **Guests self-register:** the primary enters full name + **email + mobile (both required)** and adds party members + per-event attendance. No pre-loaded guest list, so there's no "who hasn't RSVP'd" tracking by design (Anurag chases people over WhatsApp).
- **Identity = email + mobile** (stored normalized: email lowercased, phone digits-only). A unique index on `(contact_email, contact_phone)` guarantees one party per person — resubmitting **updates** rather than duplicates.
- **`parties.invite_code`** is now an internal random **edit token** kept in the browser (localStorage `rsvp:current`), not something mailed out.
- **Return visits:** same browser auto-loads via the token; a new device uses "Find my RSVP" (exact email + mobile — un-guessable, so no guest-list enumeration).
- **Server-side only:** guest tables stay deny-by-default under RLS; all RSVP reads/writes go through `/api/rsvp/*` routes using the service role. Never expose a public name-search of guests.
- **Admin (Anurag):** Supabase Auth on `/admin` routes only.

## Registry behavior
- Items link to external stores (Amazon, IKEA, etc.) — no payment processing on this site.
- Claim has two states: **"planning to buy"** (soft 6-hour hold that auto-releases) and **"already bought"** (permanent; requires a mandatory **order ID** so an accidental click can't mark it purchased).
- Every claim requires name + email + phone (stored for the couple's reference only, never shown publicly) and silently links to the claimer's party via their cached RSVP token.
- `registry_claims` is deny-by-default under RLS; only the claimer's first name is ever sent to the browser.

## Notifications
- **Web Push** with VAPID keys — no email (no Resend), no programmatic SMS.
- iOS: web push requires standalone mode (Add to Home Screen). Detect `window.navigator.standalone` and show Add-to-Home-Screen instructions if not installed. Never prompt for permission in a Safari tab on iOS.
- Android/desktop: prompt directly via "Enable updates" button.
- On skip/decline: show soft warning that they may miss updates; point to the Updates section.
- Admin posts announcement → optionally triggers push to all opted-in subscriptions.

## Keep-alive
- GitHub Actions workflow runs daily, pings the `keep_alive` table via Supabase REST API.
- Uses the **anon key** stored as a GitHub secret — never the service-role key.

## Environment variables
See `.env.example` for the full list. Rules:
- `NEXT_PUBLIC_` prefix = ships to browser. Only anon key may have this prefix.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only — never `NEXT_PUBLIC_`.
- All secrets in env vars, never in code or committed to the repo.

## Media plan (Phase 7)
Home page layout, top to bottom:
1. **Hero** — best couple photo as background + dark gradient scrim for text legibility; names, date, countdown, RSVP over it. (Photo, not video — instant load, emotional anchor.)
2. **The Celebrations** — the 3 event cards.
3. **Ambient video bands** — 2–3 short (6–10s) muted, autoplaying, lazy-loaded loops via Cloudflare Stream as section accents. IntersectionObserver: only load/play when scrolled near, pause off-screen. Cap at ~3 autoplaying loops total for performance.
4. **Gallery** — photo grid; longer videos are tap-to-play here (unlimited, since they download only on tap).

Extra sections to build (confirmed of interest, prioritize): Our Story / timeline, Travel & Stay (hotels, ATL airport, parking), FAQ, Add-to-Calendar buttons per event. Optional/lower: schedule timeline view, dress-code color swatches, opt-in background music (off by default).

## Security (Phase 10)
- **RLS audited** against the live DB: sensitive tables (`parties`, `guests`, `event_attendance`, `registry_claims`, `push_subscriptions`) return 0 rows and reject writes via the anon key. Public-read only on `events`, `registry_items`, `settings`, and published `announcements`.
- **Rate limiting** (`src/lib/rateLimit.ts`, in-memory per-IP) on `/api/rsvp/submit` (15/min), `/api/rsvp/lookup` (10/min), `/api/registry/claim` (15/min), `/api/push/subscribe` (20/min).
- **Cloudflare Turnstile** (`src/lib/turnstile.ts` + `Turnstile.tsx`) on the RSVP and registry-claim forms — **gracefully optional**: the widget shows and tokens are verified only when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` are set. Add real keys after creating a Cloudflare account.
- **Security headers** in `next.config.ts`: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS.

## Things to NEVER do
- Store photos or videos in the database — use R2 / Cloudflare Stream.
- Expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or commit any secret.
- Build payment processing — registry links out to external stores only.
- Integrate email (Resend) or programmatic SMS — web push + Updates section only.
- Assume iOS web push works in a Safari tab — requires Add to Home Screen.
- Skip RLS on any table that holds guest data.
- Use `NEXT_PUBLIC_` on any secret key.

## Build phases
1. ✅ Scaffold — Next.js + TS + Tailwind, Supabase client, CLAUDE.md, .env.example
2. Database — schema SQL + RLS policies
3. Core pages — home/hero, event details
4. RSVP flow — invite-code access, party members, per-event attendance, localStorage
5. Registry — catalog + claim flow
6. Admin dashboard — Supabase Auth, RSVP views, CSV export, registry management
7. Media — R2 Image loader + Cloudflare Stream
8. PWA + Web Push — manifest, service worker, VAPID, iOS flow, Updates section
9. Keep-alive cron — GitHub Actions
10. Security pass — RLS audit, Turnstile, rate limiting
11. Deploy — Vercel, env vars, live test on phone + laptop
