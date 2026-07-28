# Changelog

## 2026-07-28 15:20 IST · Phase 1: delete the journeys layer

Journeys let a buyer self-select a category, which pre-empts the match quiz and
undercuts the core thesis: the system tells the user who they are, the user does
not pick a bucket.

**Removed**
- `/journeys` and `/journeys/[slug]` routes, `journey-card.tsx`, and the journey
  seed module. `/journeys` and `/journeys/*` now 301 to `/explore`.
- Journeys dropdown from the desktop navbar and the mobile sheet, journey links
  from the footer, and the "Choose your journey" homepage section.
- The hero stat counters (Listings 26 / Acres 69+ / Journeys 4). Thin inventory
  should not be advertised, so the card now reads "Verified before it reaches
  you" with a "Minimum 1 acre" badge.
- The journey filter and `?journey=` param on `/explore`.

**Kept, deliberately.** The per-use-case scores were the actual matching signal,
not decoration: they drive the quiz and `buildSuitability()` derives all five
suitability ratings from them. Deleting the data would have silently gutted
matching, so the type layer was renamed instead of removed. `JourneyId` is now
`UseCase`, `Property.journeyFit` is now `Property.useCaseFit`, and the labels
live in a new `src/data/use-cases.ts`. These are plot attributes used by the
engine, never a browse path. The Postgres column is still `journey_fit`, mapped
in the store layer, and gets renamed with the Phase 2 schema rebuild rather than
in a one-off migration.

**Dead code removed on the way through:** `src/data/properties.ts` (800+ lines of
seed data superseded by `supabase/seed.sql`), `stat-counter.tsx`, and
`scroll-to-section-button.tsx`.

**Verified:** `/journeys` and `/journeys/polyhouse` both return 301 to
`/explore`; zero occurrences of "journey" in the rendered DOM of `/`, `/explore`,
`/match` and a property page; tsc, eslint and `next build` all clean.

- `(8872df6)`

## 2026-07-28 14:05 IST · Admin dashboard redesign + remove professionals directory

**Admin shell + dashboard, rebuilt**
- The dashboard was seven identical count cards, five of them reading `0`. It is now organised around what an admin actually opens it to do: a "Needs attention" band listing only the queues with real work (or a single calm "all caught up" strip when there is none), a merged recent-activity feed across recces, submissions, enquiries and captures with relative timestamps, a Portfolio panel of numbers computed from live listings (acres, corridors, average price/acre, FID coverage, verification pass rate), and catalogue counts demoted to a compact strip at the bottom.
- Dropped the "Storage" card. It was rendering the literal string `{SUPABASE_STORAGE_BUCKET}` as if it were a value.
- Sidebar is now a deep-green rail with the nav grouped Incoming / Catalogue / Team, **active-route highlighting** (previously nothing indicated which page you were on), and count badges on queues with work waiting. Mobile nav gets the same badges plus a fade on the right edge so it is visible that more items scroll off.
- Sidebar badges and the dashboard band read from one shared `getAdminAttentionCounts()`, so they cannot drift apart.

**Professionals / services directory removed**
- Removed entirely at the user's request: public `/professionals` routes, the admin CRUD, the card + directory components, the store layer, seed data, the `Professional`/`ProfessionalCategory` types, and the `professionals` table (`schema.sql` now drops it; the seed block is gone).
- Also removed the unused `Vendor`/`Broker` seed types and data files, dead weight from the original marketplace sketch, never rendered anywhere.
- Journeys keep working: `relevantProfessionalCategories` is gone from the journey type and data, and the property/journey pages no longer render matched specialists. Header, footer, and homepage links now point at "List your land" instead.
- Copy that promised something we no longer offer was rewritten rather than left dangling. The homepage's third value card is now the six-point verification story, and two journey FAQs no longer refer buyers to platform professionals.

**Security fix found while editing the schema:** `agents` and `recces` were missing from the RLS block, so the migration would have created them with row-level security disabled, meaning the anon key could have read `agents.password_hash`. Both are now in the list, with a comment explaining why they must stay. They were also missing their `updated_at` triggers; added.

**User-facing:** no more professionals directory anywhere on the site; admin is legible.

- `(aa5bb26)`

## 2026-07-23 23:10 IST · Agent login + recce, AFORACRE doc alignment, zoom prototype

Three batches of work that had been sitting local, now shipped together.

**Agent login + recce (new)**
- Field agents get their own accounts and portal (`/agent/login`, `/agent`, `/agent/recce/[id]`), completely separate from the shared admin password — different cookie, different secret, different check. An admin session grants no agent access and vice versa.
- A "recce" is an assigned site survey with a lifecycle (assigned → submitted → approved/sent back), covering three kinds: scouting unlisted land, pre-visit checks on a listed plot, and being the on-site contact for a client visit.
- Admin side: `/admin/agents` (create, disable, reset password) and `/admin/recces` (assign, review).
- Security notes: passwords are scrypt-hashed (`node:crypto`, no new dependency), session tokens are WebCrypto HMAC so Edge middleware can verify them without a DB hit, and `requireAgent()` re-reads the `active` flag on every request so disabling an agent takes effect immediately. Agents can only ever read their own recces — enforced in the database query, not just hidden in the UI.

**AFORACRE document alignment**
- FID numbers + a 6-point Verified Badge on properties, editable in admin.
- Real enquiry capture wired into the property page, professional page, the match quiz's weak-match fallback, and a "Schedule a visit" flow — plus an `/admin/enquiries` inbox. Replaces the old disabled placeholder buttons.
- Match quiz: scenery options merged 6→5 per the doc's revision, AFORACRE persona naming, schedule-a-visit CTA.
- Seller "Submit Land" intake at `/submit-land` (gunta-based sizing with live acres conversion) → `/admin/land-submissions` review queue → approval assigns a FID and creates a draft listing.
- Homepage: 5-point "holistic land" section from the source docs.

**Zoom prototype**
- `/zoom` — a continuous zoom-through effect built from real forest/farmland photography. Pure CSS transform+opacity, GPU-composited, no JS per-frame work.

**User-facing:** agents can now be issued logins and sent on site surveys from their phones; enquiry buttons actually submit instead of being disabled placeholders.

**Needs a migration:** `supabase/schema.sql` gained `agents` and `recces` tables. Until it's re-run in the Supabase SQL Editor, those two features show graceful placeholders rather than persisting — everything else works.

- `(6268e5c)`

## 2026-07-21 18:30 IST · Fix icon/logo mismatch

- `public/brand/icon.png` and the icon embedded inside `public/brand/logo.png` were two different renderings of the same mark — different corner radius (rounded vs. sharp) and different color treatment (two-tone with gold accent vs. single-tone green). Admin (which uses the standalone icon) and the public header's unscrolled state (which uses the full logo) looked like different logos side by side.
- Fixed by cropping the icon directly out of `logo.png`, so both are now pixel-consistent — same source, same rendering, everywhere.
- User-facing: the icon in admin/login/capture now matches the one in the header exactly
- `(6ffbd1e)`

## 2026-07-21 17:25 IST · Search matching fix, pill reorder, explore heading trim

- Search bug fix: query was matched as one literal phrase, so "farm land" (with a space) found zero results even though "farmland" appears throughout the data. Now splits the query into words and requires each word to appear somewhere in the property's searchable text — "farm land" now correctly matches "farmland"
- Hero feature pills reordered: Search by use case, Setup help on tap, Tax & legal (was Search / Tax & legal / Setup)
- `/explore` heading trimmed to "Explore the best land." and the descriptive subtext paragraph removed
- User-facing: search actually returns results for natural multi-word queries now
- `(0224d73)`

## 2026-07-21 17:05 IST · Hero search bar replaces two-button CTA

- Homepage hero: replaced the "Explore all land" / "Start with a journey" button pair with a single search bar (location, tag, or free-text — e.g. "polyhouse", "Kanakapura") plus a "Map" button, both leading into `/explore`
- `/explore` now accepts a `q` search param and filters by property title, area, corridor, description, and tags — also added a visible, editable search input on the explore page itself so the query can be refined after landing
- Journeys are still reachable via the header nav and the dedicated journeys section further down the homepage, so nothing was lost by dropping the "Start with a journey" button
- User-facing: one clear search-first entry point instead of two competing buttons
- `(f7e2958)`

## 2026-07-21 16:20 IST · Fix real mobile layout breakage (hero, footer, property/professional pages)

- Root cause: several two-column layout grids used `lg:grid-cols-[...]`/`sm:grid-cols-*` with no base `grid-cols-1`, so below that breakpoint the browser sized the single implicit column to its widest child's intrinsic content (in the homepage hero, the horizontally-scrolling chip row) instead of the viewport — pushing the whole hero/section far wider than the screen
- This was invisible in my own checks because a page-wide `overflow-x: clip` guard (added earlier) hides the resulting horizontal scrollbar — it masks the symptom but not the cause, so the oversized content was being silently clipped off-screen instead of visibly overflowing. Confirmed live via element-level bounding-box checks, not just scrollWidth.
- Fixed on: homepage hero, journey-page hero, property-page gallery/header grids, professional-detail page grid, and the shared footer (present on every page)
- User-facing: mobile layout was genuinely broken (hero text/buttons cut off, not just cosmetically loose) — now renders correctly at narrow widths
- `(a646354)`

## 2026-07-21 15:55 IST · Editorial Earth polish pass

- Hero: removed a redundant badge/subtitle row above the headline, bumped hero type size further, made the three feature-chip pills horizontally scrollable on mobile instead of wrapping/overflowing, minor copy tweaks
- Journey cards: accent-tag badge moved to a floating top-left pill instead of an inline block above the title
- Professional cards: rating badge moved inline next to the name; tagline and service-area rows now have fixed heights so cards line up evenly in the grid
- Header + admin layout: added `min-w-0` on flex containers to prevent horizontal overflow (same class of fix as the grid-overflow fix already on main)
- User-facing: tighter, more consistent visual polish on top of the Editorial Earth redesign; no functional changes
- `(5d058c4)`

## 2026-07-21 00:05 IST · Header logo sizing + contrast fix

- Header logo/icon bumped up (36px → 44px) and header background changed from translucent cream-blur to solid white, so the dark-green logo has clean contrast instead of blending into a busy/translucent backdrop
- User-facing: logo reads more clearly in the header
- `(2e5b652)`

## 2026-07-20 23:10 IST · Real logo assets + hero video fix

- Fixed hero background video: it was being deliberately hidden (`display:none`) whenever the browser reports `prefers-reduced-motion: reduce` — falling back to a static poster image by design. Confirmed via direct check that this was firing. Removed the gate since the video is muted/looping (broadly acceptable regardless of motion preference) and it was the actual, repeated cause of "video not playing."
- Replaced the hand-recreated brand mark with the real logo/icon PNGs (no source file existed before, only a reference image)
- Header now swaps between the full logo (top of page) and icon-only (once scrolled past ~24px) — scroll-based, matches the requested behavior
- Same real icon now used for the favicon and across admin/login/capture pages (previously a hand-built approximation)
- User-facing: hero video now visible/plays for everyone; real logo/icon shown everywhere instead of a placeholder
- `(0be4ca4)`

## 2026-07-20 22:30 IST · Brand refresh — official style guide

- Adopted the official brand palette: Forest Green `#1F3A2E`, Deep Green `#0E241B`, Sand `#EDE6D5`, Terracotta `#C56A4A`, Warm Stone `#B8AD9A` (refines the earlier close-approximation tokens to the authoritative hex values)
- Swapped body/supporting-text font from Inter to Montserrat, per the style guide (Playfair Display for headings was already correct)
- Recreated the brand mark (mountain-over-horizon-and-road monogram) as a reusable `currentColor` SVG component — no source file was available, only a reference image, so it's hand-built to match
- Reinstated the icon next to the "A for Acre" wordmark in the header, footer, admin sidebar, admin login, and capture page — using the real brand mark this time, not a placeholder
- New favicon using the same mark
- User-facing: site now shows the finalized brand colors, fonts, and logo mark everywhere
- `(d2f6f7d)`

## 2026-07-20 21:15 IST · Ignore /build skill's local state directory

- Excluded `.claude/state/` from git — it's local task-tracking state, not repo content
- `(f865894)`

## 2026-07-20 20:40 IST · Migrate data layer from local JSON store to Supabase

- Replaced the file-based `.data/*.json` store with real Supabase Postgres tables (`properties`, `professionals`, `tags`, `captures`) — same function signatures throughout `src/lib/store/*`, so no page/component changes needed
- Replaced local-filesystem photo uploads with Supabase Storage — required for this to work on Vercel's serverless (non-persistent) filesystem at all
- Added `supabase/schema.sql` (tables, indexes, RLS, grants) and `supabase/seed.sql` (generated from the live 26 properties / 12 professionals / 14 tags) for one-time setup in a fresh Supabase project
- User-facing: none directly — this is the backend swap that makes admin edits and the live deployment actually persist data, instead of resetting on every serverless cold start
- `(73fffa1)`
