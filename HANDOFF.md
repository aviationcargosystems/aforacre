# 🔀 Context Handoff — A for Acre — 2026-07-20

## Goal / what we're doing
Building **A for Acre**, a land-discovery web app for South Bangalore (polyhouse farming, commercial farming, retirement, weekend-getaway journeys), with a mock-data-driven public site, an internal admin backend, and a field-capture tool for site-visit photos/GPS. Real database deliberately deferred — "we'll see about the database... once we send it out."

## Project facts
- Repo: local only — `git remote -v` is empty, no GitHub/remote configured
- Path: `C:\Users\user\Builds\Project A`
- Branch: `master`
- Deploy: none — local dev only (`npm run dev`, port 3000, via `.claude/launch.json` config named `"dev"`)
- Live now: dev server was running at http://localhost:3000 when this thread ended (session-scoped — restart it in the new thread with `preview_start {name: "dev"}`)
- Stack: Next.js 16.2.10 (App Router, Turbopack) + TypeScript + Tailwind v4 + shadcn/ui + react-leaflet
- Storage: file-based JSON under `.data/*.json` (gitignored), seeded once from `src/data/*.ts` on first read. Current counts: 26 properties, 12 professionals, 14 tags, 0 captures.

## State right now
- On origin/main: N/A — no remote
- Local git: **only 1 commit exists** (`68b91c9 Initial commit from Create Next App`). Every feature built across this entire conversation — the full site, the admin backend, the capture tool, all branding/theme work — is **uncommitted** (modified + untracked files in the working tree). Nothing has been pushed or committed since. Do not assume anything is saved to git; if the user wants a commit, ask first per standing instructions.
- Uncommitted: extensive — see `git status --short` for the full list. Key untracked dirs: `src/app/admin/`, `src/app/capture/`, `src/components/`, `src/data/`, `src/lib/`, `public/unsplash/`, `public/videos/`, `.claude/`.
- Work queue: no `.claude/state/todo.md` — no active /build queue.

## What shipped this thread (chronological, newest first)
1. **Brand correction (final)**: brand name is **"A for Acre"** — a single name, no "Project A" prefix and no separate subtitle. (Earlier in the session it was briefly "Project A" with subtitle "A for Acre" — that was wrong and has been fully reverted. Every occurrence of "Project A" was removed from the codebase.)
2. **Favicon fix**: was still the default Next.js icon. Replaced with `src/app/icon.svg` — the same Sprout leaf glyph used in the header, on a forest-green rounded background. Deleted the stale `src/app/favicon.ico`.
3. **Hero fix**: the gradient overlay used to fade to the page's cream background color (`to-background`), which read as "white bleeding into the hero." Changed to a pure black-based gradient (`from-black/65 via-black/25 to-black/55`) that never blends toward white — hard clean edge into the next section instead.
4. **Hero video**: replaced the static hero photo with a looping background video — aerial Indonesian rice-paddy footage from Mixkit (free license, no attribution required), downloaded to `public/videos/hero-farmland.mp4`, credited in `public/videos/_credits.json`. Falls back to the original still photo for `prefers-reduced-motion` users.
5. **Admin backend** (the /loop-driven build): full CRUD for properties, professionals, and tags at `/admin/*`, gated by a simple shared-password login (`ADMIN_PASSWORD` env var, defaults to `"projecta-admin"` in dev — **must be set before this is ever exposed beyond localhost**). Session is a stateless hashed cookie (`src/lib/auth.ts`), enforced by `src/proxy.ts` (Next 16 renamed `middleware.ts` → `proxy.ts`) plus a `requireAdmin()` re-check inside every server action.
6. **Field capture tool**: public `/capture` page — camera photo capture + geolocation (auto with manual lat/lng fallback), submits via a React 19 `useActionState` server action to `/admin/captures`, where an admin can review/status-change/delete or "Use in new property" to prefill a new listing from the capture's photos + coordinates.
7. **Data-layer refactor**: extracted tax/suitability calc into `src/lib/property-builder.ts` so both the seed data and the admin create/edit forms share one code path. All public pages (`/`, `/explore`, `/journeys/[slug]`, `/property/[slug]`, `/professionals*`) now read from the file-based store (`src/lib/store/*.ts`) instead of static imports, so admin edits show up live. Routes are `force-dynamic` (SSR per request) rather than statically generated, since the data is now mutable.
8. **Full verification pass**: tsc/eslint/build all clean; live-tested login, property add/edit/delete (tax math hand-verified against the Karnataka formula), professional add/delete, tag add/remove, a real photo-upload capture end-to-end (file confirmed on disk), capture→property prefill, and logout re-locking `/admin`. All test artifacts were cleaned up afterward — data store is back to the clean baseline (26/12/14/0).

Earlier in the conversation (before the /loop build): the entire site was scaffolded from scratch via plan mode — theme ("earthy premium": forest green + terracotta + Fraunces/Inter), mock data for 26 properties across South Bangalore corridors (Kanakapura Road, Sarjapur, Anekal, Bannerghatta Road, etc.), 12 professionals across 9 service categories, 4 journeys, Karnataka tax/legal reference content, and all public pages including the Leaflet-based `/explore` map. Property/professional imagery was later "Indianized" (swapped generic Western stock photos for Indian-context Unsplash photos, credited in `public/unsplash/_credits.json`).

## Blocked
- None — all deliverables from this thread's work are complete and verified.

## Open decisions for the user
- When to add a real database (explicitly deferred: "once we send it out, we can probably have the database and everything set up").
- Whether/when to make the first git commit — nothing has been committed yet.
- `ADMIN_PASSWORD` needs to be set in `.env.local` before this app goes anywhere near a shared/public environment.

## Re-activate in the new thread
- Caveman mode: OFF this session (user's global CLAUDE.md has it on by default — no explicit "stop caveman" was said, worth checking user's global instructions if responses seem off-tone)
- /build queue: not active
- /loop: not active (last /loop run completed and reported out fully)
- Plan mode: not active

## Conventions to follow (carry these over)
- **Never commit unless explicitly asked** — this project has a large uncommitted working tree by design (nothing has been requested to be committed yet).
- **Brand name is "A for Acre"** — single name, no "Project A", no subtitle. This was corrected twice in this session; treat it as settled.
- Image sourcing: use the `unsplash-images` skill for photos (verify HTTP 200 before using, credit in `public/unsplash/_credits.json`); for video, direct-download from a no-attribution-required source (Mixkit worked well) into `public/videos/`, credit in `_credits.json` there too.
- Admin/capture routes intentionally do NOT show the public marketing header/footer — `src/components/site-chrome.tsx` handles that split by pathname.
- **Browser-pane automation gotchas** discovered this session, if further live UI testing is needed:
  - `computer` (screenshot/click/type) has been unreliable/timing out in this environment — prefer `javascript_tool` with `requestSubmit()` on precisely-scoped forms, and manual `Object.getOwnPropertyDescriptor(...).set` value-setting for React-controlled/uncontrolled inputs.
  - Admin pages have multiple `<form>` elements per page (e.g. sidebar logout form + the actual content form) — never use a bare `document.querySelector('form')`; scope by submit-button text or a specific container instead, or you'll accidentally submit the wrong form (this caused an accidental logout mid-testing).
  - `confirm()` dialogs (delete buttons) block the page's JS thread entirely if triggered without first overriding `window.confirm = () => true` — a stuck dialog previously wedged a tab hard enough that even `navigate` timed out; had to close and reopen the tab.
  - Each `javascript_exec` call seems to share script scope with prior calls on the same page — wrap scripts in an IIFE with locally-scoped `const`/`let` names to avoid "already declared" errors.
  - File uploads can be simulated via a synthetic `File` + `DataTransfer` assigned to the input's `.files`, then dispatch a `change` event — confirmed working for testing the capture photo upload path.

## Links
- None external — everything is local-only right now.

## ▶️ Start here in the new thread
Ask the user what's next (no open task was mid-flight when this handoff was written). If they want to keep working on the app, start the dev server first: `preview_start {name: "dev"}`, then `preview_list` to confirm the port before navigating.
