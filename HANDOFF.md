# 🔀 Context Handoff — A for Acre (Project A) — 2026-07-21

## Goal / what we're doing
"A for Acre" — a South Bangalore land-discovery marketplace (Next.js 16 + Supabase). Full site built, admin backend + field-capture tooling live, brand assets finalized, and live on Vercel. Current thread's main work: a full visual "Editorial Earth" redesign pass inspired by a reference site (sanctityferme.com) the user shared, plus a mobile-overflow bug fix. Latest, still-unanswered ask: user wants enquiry/lead capture wired up ("get in [enquiry] details coming in") — scope not yet confirmed.

## Project facts
- Repo: `https://github.com/aviationcargosystems/aforacre.git` — **the local git remote URL currently has a GitHub PAT embedded in it (`git config --get remote.origin.url`). Do not print/reuse that token. Flag to the user to rotate it and reset the remote to a clean HTTPS/SSH URL.**
- Branch: `main` (matches Vercel's Production Branch setting)
- Deploy: Vercel, auto-deploys on push to `main` → live at `https://aforacre.vercel.app`
- Vercel project is NOT accessible via this session's Vercel MCP tools (outside the `bconclub` team scope) — verify deploys via curl/browser against the live URL, not MCP calls
- Local dev: `npm run dev` (port 3000), start via Browser-pane `preview_start {name: "project-a"}` — NOT plain Bash
- Admin password lives in `.env.local` (`ADMIN_PASSWORD`) — never paste its value into chat, and never enter it into the login form myself (hard rule, see Conventions)
- Supabase backend: Postgres + Storage, credentials in `.env.local` (gitignored)

## State right now
- On `origin/main`: `6e4cf2c` "Fix changelog commit reference" — local HEAD matches origin (nothing committed-but-unpushed)
- Uncommitted (working tree): **large** — two overlapping sets of changes:
  1. **This thread's "Editorial Earth" redesign** (verified, see below): `src/app/page.tsx`, `journeys/[slug]/page.tsx`, `property/[slug]/page.tsx`, `professionals/page.tsx`, `professionals/[slug]/page.tsx`, `components/explore-view.tsx`, `journey-card.tsx`, `professional-card.tsx`, `professionals-directory.tsx`, `property-card.tsx`, `site-footer.tsx`, `ui/button.tsx`, `app/layout.tsx`, plus new files `components/section-heading.tsx` and `components/stat-counter.tsx`. Also the admin mobile-grid-overflow fix: `admin/(protected)/page.tsx`, `admin/(protected)/captures/page.tsx`, `admin/(protected)/professionals/page.tsx`, `components/admin/professional-form.tsx`, `components/admin/property-form.tsx`.
  2. **Changes NOT authored by this thread's tracked edits — origin unclear, investigate before touching:** `src/components/site-header.tsx` (230-line diff — substantial, not a small tweak), `src/components/hero-video.tsx`, `src/components/newsletter-form.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/card.tsx`, `src/app/explore/page.tsx`, `src/app/globals.css`, `public/brand/logo.png`. Two system-reminders during this thread also noted `stat-counter.tsx` and `section-heading.tsx` were modified outside my edits (kicker-with-lines treatment, bigger type scale, `text-pretty`) — those look like accepted refinements, not conflicts. New untracked files also present: `mobile-home.png`, `public/videos/hero-a-for-acre.mp4`, `src/components/featured-land-carousel.tsx`, `src/components/scroll-to-section-button.tsx`.
  **→ Before committing/pushing anything, run `git status --short` and `git diff` fresh and actually read what's in the site-header.tsx / explore / globals.css changes — don't assume they're either "mine" or safe.**
- Work queue: see `.claude/state/todo.md` — 3 pending, 2 blocked, 0 deferred (full detail there; headline copied below)

## What shipped this thread (newest first, all still local/uncommitted)
- Fixed the same mobile-grid-overflow bug (missing base `grid-cols-1` before `sm:`/`lg:` grid variants) across 5 admin files — `tsc`/`eslint` clean; could NOT visually verify live in `/admin` because that requires entering the admin password, which I don't do even for the user's own local dev site (hard rule, not a judgment call) — user should eyeball it next time they're logged in on a narrow viewport.
- "Editorial Earth" redesign pass: new `pill`/`pill-outline` button variants, oversized hero type with italic accent word (kept Playfair Display — the "different font entirely" the user mentioned is still unnamed, see Blocked), real-numbers stat strip (property count / total acres / professional count / corridors — computed from live Supabase data, not fabricated), softened bigger-radius cards, new `SectionHeading` + `StatCounter` shared components, closing full-bleed CTA band before the footer. Scope: home, journeys/[slug], property/[slug], professionals, professionals/[slug], explore filters. Admin + `/capture` explicitly left untouched by design.
- Along the way found and fixed a **pre-existing, site-wide** bug: multiple grids had no base `grid-cols-1`, letting the browser's implicit grid track size to a child's intrinsic content width and overflow horizontally on mobile. Fixed on all public pages + the shared footer.
- Verified: `npx tsc --noEmit` and `npx eslint .` clean; DOM/class-level checks confirm zero horizontal overflow at 375px across all 5 public page types (screenshots and `IntersectionObserver`-based checks were unreliable in-session because the browser tab was backgrounded/`document.hidden`, not a code defect — confirmed via `document.visibilityState`).
- Before this: header logo bumped 36px→44px + solid white header bg for contrast (`2e5b652`, **pushed**), real logo/icon PNG assets + hero-video `prefers-reduced-motion` fix (`0be4ca4`, **pushed**), full brand-hex/Montserrat refresh (`d2f6f7d`, **pushed**).

## Blocked (waiting on something)
- Heading font — user said "a different font entirely" for headings but never named it. This redesign pass deliberately kept Playfair Display and focused on scale/treatment instead. Ask again.
- "10 pages are so bad" — zero specifics ever given (no page names, no description of what's wrong). Still open.
- Supabase Storage bucket `project-a-uploads` (public) not yet created in the Supabase dashboard — admin photo uploads fail (`Bucket not found`) until it exists. User needs to create it themselves (dashboard action).
- Enquiry/lead-capture request — user's message ("Let's set up the pages so that we can be ready to get in no details coming in") came through garbled. My read: wire up the currently-disabled "Request a call back" (property page) / "Request a quote" (professional page) buttons into real Supabase-backed forms, maybe with an admin inbox. I sent an `AskUserQuestion` to confirm scope but it errored out before the user could answer (`AbortError: Tool permission stream closed`) — **re-ask this in the new thread before building anything.**

## Open decisions for the user
- Confirm scope of the enquiry-capture request above.
- Say go on committing + pushing the redesign pass (it's implemented and verified but deliberately held back given the size of the visual change) — but only AFTER the unexplained site-header.tsx / explore / globals.css diffs are reviewed, since pushing blind could ship unreviewed changes.
- Name the heading font, or confirm Playfair Display stays.
- Specify which "10 pages" and what's wrong with them.
- Two GitHub PATs were pasted into chat earlier in this project's history (different thread) — confirm both were revoked, and rotate the one currently embedded in the git remote URL (see Project facts).

## Re-activate in the new thread
- Caveman mode: ON (global `~/.claude/CLAUDE.md`, always active every session — full intensity, not thread-specific)
- `/build` queue: active — resume from `.claude/state/todo.md`, don't recreate a parallel list
- `/loop`: not active
- No GPFC mode, no other stateful mode in play

## Conventions to follow (carry these over)
- Never paste secrets/tokens into chat or embed them in Bash commands — if the user pastes one, stop and hand them manual terminal commands instead of routing around the block.
- Verify claims against live behavior, not "it's done" — this project's history had repeated cases where "it ran successfully" didn't match live state.
- After every push: confirm the deploy landed (curl/browser against `aforacre.vercel.app`), not just that git accepted the push.
- Default git branch is `main` (matches Vercel Production Branch) going forward.
- Never enter passwords into login forms myself, including this project's own admin login — hard rule, applies even to the user's own local dev site.
- This project's `AGENTS.md`/`CLAUDE.md` says: read `node_modules/next/dist/docs/` before writing Next.js code — this app is on a Next.js version with breaking changes vs. training-data assumptions.

## Links
- Live site: https://aforacre.vercel.app
- Repo: https://github.com/aviationcargosystems/aforacre (see PAT warning above — do not construct URLs with embedded credentials)
- Local dev: http://localhost:3000 (start via Browser-pane `preview_start` with name `project-a`, NOT plain Bash)

## ▶️ Start here in the new thread
Run `git status --short` and `git diff src/components/site-header.tsx src/app/explore/page.tsx src/app/globals.css` fresh to understand the unexplained changes before doing anything else — then re-ask the user to confirm the enquiry-capture scope (the `AskUserQuestion` that errored out), and separately get their go-ahead to commit/push the verified "Editorial Earth" redesign once the site-header question is resolved.
