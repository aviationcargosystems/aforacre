# Changelog

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
- `(pending)`

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
