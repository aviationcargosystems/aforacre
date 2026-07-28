# AUDIT — A for Acre (Phase 0)

State of the repo as of `2c1e692`, before any work from the new brief begins.

Headline: the codebase is a **marketing site with a CMS bolted on**, not the product
described in the brief. It has no user accounts, no roles, no RLS, no submission
lifecycle, no visit scheduling, and no persona engine. Auth is a single shared
password compared with `===`. The gap is not "add features to this", it is
"rebuild the spine and keep the presentation layer".

Two things below need a decision before Phase 2 starts. They are flagged at the
bottom under OPEN QUESTIONS.

---

## 1. Route map

Framework is Next.js 16 App Router. Every route is a page. **There are zero API
routes in the repo** (`route.ts` count: 0), so Phase 10's `/api/*` surface is
entirely greenfield. Mutations run through Server Actions instead.

### Public
| Route | File | Notes |
|---|---|---|
| `/` | `src/app/page.tsx` | Hero, holistic-criteria strip, journeys grid, featured carousel, value cards, closing CTA |
| `/explore` | `src/app/explore/page.tsx` | Map + filter list, accepts `?q=` and `?journey=` |
| `/property/[slug]` | `src/app/property/[slug]/page.tsx` | **Slug-based, not FID-based** (Phase 8 wants FID URLs) |
| `/journeys/[slug]` | `src/app/journeys/[slug]/page.tsx` | To be deleted in Phase 1 |
| `/match` | `src/app/match/page.tsx` | Current 4-question quiz |
| `/submit-land` | `src/app/submit-land/page.tsx` | Public seller intake, **unauthenticated** |
| `/capture` | `src/app/capture/page.tsx` | Field photo tool, **fully public, no auth gate** |
| `/zoom` | `src/app/zoom/page.tsx` | Visual prototype, not linked from anywhere |

### Admin (`/admin`, one shared password)
`login`, `(protected)/` → dashboard, `properties` (+`new`, `[slug]/edit`), `tags`,
`captures` (+`new`), `enquiries`, `land-submissions`, `agents`, `recces`.

### Agent (`/agent`, per-person accounts)
`login`, `(portal)/` → recce list, `recce/[id]`.

### Chrome
`src/components/site-chrome.tsx` strips the marketing header/footer for
`/admin`, `/agent`, `/capture`, `/zoom`.

---

## 2. Data model

Two parallel definitions that must agree by hand: TypeScript in
`src/lib/types.ts` and DDL in `supabase/schema.sql`. There are **no migrations**.
The schema is a single idempotent file the user pastes into the Supabase SQL
editor. Nothing tracks which environment has run which version, which is exactly
why `agents` and `recces` silently do not exist in the live database right now.

| Table | Domain type | Read/written by | Live in Supabase? |
|---|---|---|---|
| `properties` | `Property` | `lib/store/properties.ts` | yes |
| `tags` | `string[]` | `lib/store/tags.ts` | yes |
| `captures` | `Capture` | `lib/store/captures.ts` | yes |
| `enquiries` | `Enquiry` | `lib/store/enquiries.ts` | yes |
| `land_submissions` | `LandSubmission` | `lib/store/land-submissions.ts` | yes |
| `agents` | `Agent` | `lib/store/agents.ts` | **NO, migration never run** |
| `recces` | `Recce` | `lib/store/recces.ts` | **NO, migration never run** |
| `professionals` | (deleted) | (deleted) | yes, orphaned. `schema.sql` now drops it |

Mapping between the two shapes is hand-written `rowToX` / `xToRow` functions in
each store module.

### How this maps onto the brief's schema
Almost nothing survives intact.

- `properties` → `plots`. Overlaps on title/price/lat/lng/water/fencing/electricity.
  **Missing:** `fid` exists but is a nullable free-text admin field, not a
  generated sequential identifier. No `status` enum (no draft/live/on_hold/sold),
  no `poc_id`, no `road_access` enum (it is free text like "Tar road, 20ft wide",
  so width is not separable without parsing), no `soil_quality` enum, no
  `area_acres >= 1.0` constraint. Current data has plots **below 1 acre**, so
  that CHECK will reject existing rows.
- `land_submissions` → `submissions`. Closest match. Missing `payload jsonb`
  (fields are columns), `reviewed_by`, `reviewed_at`, `reject_reason`, `draft`
  status, and any link to an authenticated submitter (it stores a raw phone
  string, not a `profiles` FK).
- `properties.suitability` (jsonb, 5 fixed keys) → `plot_suitability` (one row
  per use case, with `rationale`). The rationale text exists today as a `note`
  inside the jsonb, so it is portable.
- `Property.images: text[]` → `plot_media` table. Needs unpacking.
- `agents` → collapses into `profiles` with `role='agent'`.
- **No table at all today for:** `profiles`, `quiz_responses`, `matches`,
  `visits`, `audit_log`. Quiz answers are session-only React state and are
  discarded on completion.

---

## 3. Journey references (Phase 1 blast radius)

175 occurrences across 22 files. The important distinction: **journeys are both a
browse path and the scoring vocabulary**. Deleting the browse path is easy.
Deleting the data would silently gut matching.

**User-facing, delete:**
`app/journeys/[slug]/page.tsx`, `components/journey-card.tsx`, the homepage
"Choose your journey" section, the header nav dropdown (`site-header.tsx`), the
footer links (`site-footer.tsx`), the `?journey=` filter in `explore-view.tsx`,
and the "Journeys 4" stat in the hero card.

**Internal, keep as plot attributes (the brief says so explicitly):**
- `Property.journeyFit: Record<JourneyId, number>` is the actual scoring signal.
  It is read by `lib/quiz.ts` (current LFI score), `lib/property-builder.ts`
  (`buildSuitability()` derives **all five** suitability scores from it),
  `lib/store/properties.ts` (`propertiesForJourney`), and
  `components/admin/property-form-shared.ts` (the admin scoring inputs).
- `src/data/journeys.ts` also holds `whatToLookFor` checklists and FAQ content
  that are rendered only on the journey page. That copy dies with the route
  unless it is rehomed.

**Naming mismatch to resolve:** the brief's use-case list is 7
(polyhouse, commercial, farmhouse, getaway, retirement, investment, organic).
The current `JourneyId` union is 4 (`polyhouse`, `commercial-farming`,
`retirement`, `getaway`). `investment`, `organic` and `farmhouse` have no stored
score on any plot. Scores for the three new use cases do not exist and cannot be
derived. See OPEN QUESTIONS.

---

## 4. Auth

Two independent, hand-rolled tiers. **Supabase Auth is not used at all.**

**Admin (`src/lib/auth.ts`)** — one shared password from `ADMIN_PASSWORD`,
compared with `===` (not constant-time). Session cookie is
`sha256(password + ":" + secret)`, so the cookie value is a pure function of the
password: it never expires, cannot be revoked, and is identical for every person
who logs in. No user identity, so **no action is attributable to a human**.

**Agent (`src/lib/agent-auth.ts` + `agent-password.ts`)** — this tier is
genuinely sound and worth preserving the reasoning from, even though the brief
replaces it with Supabase Auth. Per-person rows, scrypt hashes with random salt
and `timingSafeEqual`, HMAC-SHA256 signed session tokens via WebCrypto so Edge
middleware can verify without a database round trip, and `requireAgent()`
re-reads the `active` flag on every request so deactivation is immediate.

**Middleware** (`src/proxy.ts`) matches `/admin/:path*` and `/agent/:path*` only.

**Consequences relevant to the brief:**
- No `profiles`, no roles, no partner tier. Brokers currently submit through a
  public unauthenticated form.
- **`/capture` is completely open.** Anyone with the URL can upload images to
  Supabase storage. This is a live hole today, not a future concern.
- **`/submit-land` is completely open.** No OTP, no rate limit, no KYC.
- Every store module uses the **service-role key**, which bypasses RLS entirely.
  RLS is enabled with zero policies purely as anon-key defence in depth. Moving
  to per-role RLS means the data layer must stop using service-role for
  user-scoped reads, which is a rewrite of every `lib/store/*` module, not a
  policy addition.

---

## 5. Admin surface

Nine pages behind one shared password. Just rebuilt this session: the dashboard
is now a triage queue (actionable queues, merged activity feed, portfolio
numbers computed from live data) and the shell has grouped nav with
active-route highlighting and count badges.

**What is structurally wrong for the new brief:** there is no role distinction,
so `/agent` cannot be a scoped subset of admin. Approving a land submission
calls `approveLandSubmission()` which assigns an FID via `nextFid()` = "highest
existing + 1" read-then-write, with **no uniqueness enforcement and no
transaction**. Two concurrent approvals will produce duplicate FIDs. The brief
explicitly requires this to be safe under concurrency.

Remaining inconsistency: form styling is duplicated between `property-form.tsx`
and `capture-form.tsx` (local `Field` / `inputClass` definitions), and list
rendering uses three different idioms across pages.

---

## 6. Dead code and unused components

Confirmed by import search, zero references outside their own definition:

| File | Note |
|---|---|
| `src/components/stat-counter.tsx` | Count-up-on-scroll. Built for a stat strip that no longer exists |
| `src/components/scroll-to-section-button.tsx` | No importer |
| `src/components/map/pin-location-map.tsx` | Superseded by `pin-location-picker.tsx` |
| `src/components/ui/avatar.tsx` | shadcn scaffold, never used |
| `src/components/ui/dialog.tsx` | shadcn scaffold, never used |
| `src/components/ui/tabs.tsx` | shadcn scaffold, never used |
| `src/components/ui/dropdown-menu.tsx` | shadcn scaffold, never used |
| `/zoom` route + `zoom-through.tsx` | Prototype, not linked from any nav |
| `src/data/properties.ts` | 800+ lines of seed data, superseded by Supabase. Only `seedProperties` historical reference |

Also: `src/data/journeys.ts` becomes dead weight after Phase 1 except for the
`JourneyId` union used by `journeyFit`.

---

## 7. Bugs confirmed against live code

1. **Footer social icons render as literal text.** `site-footer.tsx:6` is
   `const socialMonograms = ["f", "IG", "yt", "in"]`, rendered as text spans.
   Reading the four in sequence gives "fIGytin", exactly as reported. They are
   also not links, they point nowhere.
2. **Footer tagline** at `site-footer.tsx:25` is "A calmer way to explore land",
   and it still promises "the people who can help" after the professionals
   directory was removed. Both need replacing.
3. **Hero stat card** advertises "Listings 26 / Acres 69+ / Journeys 4". The
   brief wants the counters gone and Phase 1 removes journeys anyway.
4. **`ADMIN_PASSWORD` is silently truncated.** The value in `.env.local`
   contains a `#`, and dotenv treats everything from `#` onward as a comment, so
   the password that actually works locally is only the prefix. Verified
   empirically. Fix is to quote the value. Not changed here because it alters
   what the user types to log in.
5. **`nextFid()` race** described in section 5.
6. **Em dashes are throughout the existing copy and comments**, against the new
   standard. Roughly 60+ occurrences. They will be removed file by file as each
   phase touches its files rather than in one sweeping commit that would collide
   with every subsequent diff.

---

## 8. What is reusable

Worth keeping rather than rebuilding: the Leaflet map stack
(`map/leaflet-map.tsx`, `property-map.tsx`, `pin-location-picker.tsx`), the
image upload path (`lib/store/uploads.ts` → Supabase storage), the geolocation
and photo-preview mechanics in `capture-form.tsx` (directly reusable for Phase 3
partner capture), `lib/tax.ts` Karnataka tax computation, `lib/land-units.ts`
gunta conversion, the design system (`ui/button.tsx` pill variants,
`ui/card.tsx`, `ui/badge.tsx`), and `isMissingSchemaError()` in
`lib/supabase/server.ts` which degrades reads gracefully when a table is absent.

---

## OPEN QUESTIONS — need answers before Phase 2

1. **Existing plots below 1 acre.** The brief specifies
   `area_acres numeric CHECK >= 1.0` and "Minimum 1 acre" as a public standard,
   but the current dataset contains sub-acre listings. Migrate them and let the
   CHECK reject them, drop them, or grandfather them in as `status='on_hold'`?

2. **Suitability scores for the three new use cases.** `plot_suitability` needs a
   row per use case per plot, and matching depends on it. Existing plots have
   real curated scores for only 4 of the 7 use cases. `investment`, `organic` and
   `farmhouse` have no data behind them. I will not fabricate scores. Options:
   backfill them by hand in the admin enrichment form, or derive them from
   adjacent signals with the rationale saying so explicitly. Deriving is
   defensible for `farmhouse` (close to the existing retirement score) but not
   for `organic`, which depends on soil history nobody has recorded.

3. **Live data on production.** 26 properties and the enquiries/submissions
   tables are live in Supabase. Phase 2 is a "full schema rebuild, migrations
   not hand edits". Migrate the existing 26 into `plots`, or start clean and
   re-enter them? Migration is straightforward for everything except FID
   assignment and the missing suitability rows.

---

## Phase 0 status

Audit complete. No code changed for this phase. Stopping here for the go-ahead
before Phase 1, per the stated execution order.
