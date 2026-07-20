# Changelog

## 2026-07-20 22:30 IST · Brand refresh — official style guide

- Adopted the official brand palette: Forest Green `#1F3A2E`, Deep Green `#0E241B`, Sand `#EDE6D5`, Terracotta `#C56A4A`, Warm Stone `#B8AD9A` (refines the earlier close-approximation tokens to the authoritative hex values)
- Swapped body/supporting-text font from Inter to Montserrat, per the style guide (Playfair Display for headings was already correct)
- Recreated the brand mark (mountain-over-horizon-and-road monogram) as a reusable `currentColor` SVG component — no source file was available, only a reference image, so it's hand-built to match
- Reinstated the icon next to the "A for Acre" wordmark in the header, footer, admin sidebar, admin login, and capture page — using the real brand mark this time, not a placeholder
- New favicon using the same mark
- User-facing: site now shows the finalized brand colors, fonts, and logo mark everywhere
- `(pending)`

## 2026-07-20 21:15 IST · Ignore /build skill's local state directory

- Excluded `.claude/state/` from git — it's local task-tracking state, not repo content
- `(f865894)`

## 2026-07-20 20:40 IST · Migrate data layer from local JSON store to Supabase

- Replaced the file-based `.data/*.json` store with real Supabase Postgres tables (`properties`, `professionals`, `tags`, `captures`) — same function signatures throughout `src/lib/store/*`, so no page/component changes needed
- Replaced local-filesystem photo uploads with Supabase Storage — required for this to work on Vercel's serverless (non-persistent) filesystem at all
- Added `supabase/schema.sql` (tables, indexes, RLS, grants) and `supabase/seed.sql` (generated from the live 26 properties / 12 professionals / 14 tags) for one-time setup in a fresh Supabase project
- User-facing: none directly — this is the backend swap that makes admin edits and the live deployment actually persist data, instead of resetting on every serverless cold start
- `(73fffa1)`
