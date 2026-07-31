# Changelog

## 2026-07-31 19:20 IST · Shelf docked and looping, journey reworked as a path

- The hero shelf is docked on the same baseline as the assurance bar, starts at exactly half the viewport and bleeds off the right edge. It loops forever in both directions: the track holds the seven cards three times and the scroll position is kept inside the middle copy, shifted by exactly one copy whenever it crosses a boundary — instantly, at a point where the copies are pixel-identical, so the jump cannot be seen.
- Three copies rather than two, and that is not arbitrary. With two, the browser clamps scrollLeft to scrollWidth − clientWidth, which sits *below* the point a forward wrap needs to fire, so the rail silently dead-ended on the last card. Three puts both thresholds inside the reachable range and leaves a full copy of track behind for backwards dragging.
- On a phone the assurances now come before the shelf: the claim belongs with the copy above it, and the shelf is the thing you scroll.
- The journey section is a path rather than a legend. Five photo cards with 01–05 ordinals, an icon straddling each image edge, and a dashed curve arcing across the row with waypoints on it. Four images are the category photography already on the page; the paperwork step got its own, since nothing in a farmland set says "title verification".
- The stats band matches: icon disc, large figure, label and a line of explanation. Values stay computed — curated properties, villages, percentage document-verified, acres listed — so three of the four read zero until the catalogue has something in it.

## 2026-07-31 18:05 IST · /v1 hero rebuilt, branded scroll, all tags on the card

- The /v1 hero is now headline left, poster shelf right, on a two-way scrim. "Find My Land" is the single action, with the cost of pressing it stated ("Takes 2 minutes"), and the four assurances read as one bordered bar rather than four loose lines.
- The shelf is a real scroller: touch, wheel, pointer drag and arrow buttons, plus a gentle auto-advance that stops for good once somebody takes hold of it. It replaced a CSS marquee that moved but could not be touched, and three infrastructure pins that floated over footage they had nothing to do with. Scroll snapping means it always rests on a card edge instead of mid-poster.
- Header is the brand lockup and one CTA. The nav, advisor number and second CTA are gone; the lockup is the same asset the public header uses, inverted to white over the video.
- Removed the finder panel and every "Project A" label — the brand is A for Acre throughout.
- Corridor cards: sharper icons, a colour and a line of real detail each, and a third typeface (Space Grotesk) so those five labels read as their own band rather than as more of the same page. The airport still carries "Site not yet finalised."
- "Explore growth map" opens the homepage corridor map in a dialog instead of leaving the page. The map is only mounted once the dialog opens.
- User-facing: property cards now show **every** tag rather than the first two, and hide the location row when a listing has no area recorded — a map pin pointing at nothing read as a bug. Tags wrap rather than scroll, because inside the featured drag-rail the inner row never received the pointer and half the tags were unreachable.
- Smooth scrolling is linear now (Lenis `lerp`) rather than a timed ease-out, which had a slow tail that arrived after the wheel had stopped.
- Seven new stock photographs, each opened and checked against the category it illustrates. The previous set was soft; these are requested at a width that survives the 3:4 crop on a 3x screen.
- The journey band sits on a photograph with numbered steps, and the sections carry the homepage's ambient wash instead of flat paper.
- Checked against the spec document: the match quiz already asks exactly its four questions, in its wording. The impression of "a lot of questions" came from the hero finder sitting above it asking four more — that panel is now gone.

## 2026-07-31 15:40 IST · /v1 matched to the reference, stock photography

- Every experience tile now carries a photograph. The seven images are stock, from the Unsplash set this project used before the catalogue was cleared. Each one was opened and checked against the category it illustrates rather than picked by id, so the forest tile is forest meeting farmland and the water tile is a river through paddy. They illustrate a kind of land, never a specific plot.
- The corridor cards use one solid colour per project with a white glyph, as in the reference, and short two-word titles. This is a deliberate break from the forest-and-terracotta palette, confined to this row and the hero pins that mirror it: the row's job is to make five projects distinguishable at a glance, which five shades of one accent cannot do. The airport's "Site not yet finalised." still renders.
- The finder's chip row and the tile rail now come from one shared list, so the two cannot drift apart. Chips are fixed rather than driven by the tag vocabulary — they are how someone describes what they want before they know our tags.
- Journey steps sit on a dashed path, and a listing with no photo of its own falls back to a stock image labelled as one.
- User-facing: the advisor phone number in the /v1 header is still a placeholder.

## 2026-07-31 14:46 IST · Design prototype at /v1, branded scrollbars, homepage fixes

- New prototype route /v1 — a full interpretation of the reference layout, parked beside the live homepage so the two can be compared without either disturbing the other. Full-bleed video hero with the three growth anchors as floating pins, a land-finder panel, corridor cards, experience tiles, featured rail, journey band and a stats strip. It reads the live catalogue; nothing is seeded to make it look fuller than the data is, so the counts read zero until listings exist. Three experience tiles say "Photo needed" rather than carry a stock photo of somewhere that is not this corridor.
- User-facing: the land-finder panel collects size and budget but cannot filter on them — /explore only accepts free text, so location, purpose and tag are composed into that. Structured filters need /explore to gain real query params first.
- Scrollbars are drawn in the brand palette instead of the platform's: a thin rounded thumb on no track, cream in the admin sidebar and foreground-tinted on light panels. Applied to the admin nav, the explore listing column and the property form body.
- Homepage "Learn more" now lands on the corridor heading rather than the map. The anchor was on the section wrapper, and on a phone the map is ordered first inside it, so the button dropped you onto the thing the section explains instead of the explanation.
- Homepage corridor map is shorter on mobile, and the ambient gradients read again. They were rendering all along — three blobs up to 620px wide with a 64px blur across a 390px screen all overlapped, so the layer flattened to a single tint. Sized in viewport widths below sm, at slightly higher opacity. Desktop is unchanged.

## 2026-07-30 02:15 IST · Fix property saving

- Property saving failed after the write, not during it. revalidatePublicPaths still revalidated /journeys/[slug], a route the rebuild deleted; the call outlived the route and threw once the save had already succeeded, so the request errored and never redirected.
- Tag upserts and revalidation after a successful save are now guarded. Housekeeping failing should never look like a failed save.
- Verified directly against Supabase that the properties schema accepts the exact row the app writes, so the migrations are correctly applied.

## 2026-07-30 01:10 IST · Drafts on the device, inline tag creation

- Quick capture keeps a draft on the device as you type — pin, area, extent, tags and label. A locked phone, an evicted tab or a failed save no longer means starting over. Restoring says plainly that photos and clips need re-picking, since files are not in the draft.
- The draft clears on a successful save, and can be discarded with "Start fresh".
- Tag picker can create a tag inline when nothing matches, matched case-insensitively so near-duplicates cannot split a filter. New tags persist from both forms.
- Saving a capture no longer takes the page down when a column is missing; it returns a readable message and keeps what was entered.

## 2026-07-30 00:30 IST · Mobile scroll, card overlay, two more region pins

- Both fixed-height shells (Add Property, Explore) are desktop-only now. On mobile they flowed inside the page's own scroller, giving two scrollbars and neither reaching the end.
- Property card: on narrow screens the price pill and the title fought for one row, truncating the title. They stack below sm.
- Found pins for Maralavadi and Kalanakuppe — they only resolve under their OSM spellings (Maralawadi, Kallanakuppe), which is why earlier searches came back empty. Sheetalwadi and Bannerghatta still return nothing and stay as chips.
- Extent takes the full width on capture so its three unit fields sit inline instead of stacking.
- Removed the "we do not list outside this belt" paragraph.
- Added supabase/clear-seed-data.sql for wiping the demo catalogue. Not run — it is destructive and yours to execute.

## 2026-07-29 23:55 IST · Quick capture down to two steps

- Quick capture is Site and Documents. Site carries photos, video, the pin, area, extent, price and tags; Documents is the RTC upload, survey number and khata.
- Price takes a per-acre / per-gunta toggle rather than two fields — only one of them is ever the number someone was actually quoted.
- Site label auto-generates from extent, area and a distinguishing tag, and stops regenerating the moment it is edited. Duplicates get numbered rather than colliding.
- Tags are a searchable picker instead of a wall of chips.
- Location: added a paste-a-map-link box, and geolocation failures now say whether permission was denied, no fix was available, or it timed out.
- Pin research suggests tags, constrained to the existing vocabulary and filtered again server-side so an invented tag cannot reach the form.
- Removed from capture: notes, listing link, soil type, road access, land observation, water sources, and the explainer subtexts.

## 2026-07-29 23:10 IST · Water source becomes a tag

- Water source is no longer its own checkbox set on the property form. Tag a listing Borewell, Open well, Rain-fed or Canal and the structured value is derived from the tags on save.
- Nothing downstream changed: suitability scoring, the explore filter and the property page's Water source fact all still read the same field.

## 2026-07-29 22:55 IST · Leaner quick capture

- Quick capture is three steps instead of four: Site, Details, Documents. Extent and tags moved onto Site, so photos, video, the pin, the size and the tags are all captured in one pass.
- Removed water sources, fenced and electricity from capture — they belong on the listing, not on a field visit.
- Removed the explainer paragraph above the form.

## 2026-07-29 22:35 IST · Video on quick capture

- Quick capture takes video alongside photos, on the Site step. Optional, and placed below the photos so nobody is waiting on a clip to upload before they can save.
- Requires migration 0013 for the captures.videos column.

## 2026-07-29 22:15 IST · Correct gunta conversion, price per gunta, leaner pricing step

- Corrected the square-foot conversion: 1 gunta is 1,089 sq ft, not 1,100. The spec's figure did not survive multiplication — 40 x 1,100 is 44,000 sq ft, about 1% over an acre — where 40 x 1,089 is exactly 43,560, the survey acre. Nothing stored changes; extent is held in acres.
- Price can now be entered per gunta or per acre, each following the other. Per-acre stays the stored value.
- Removed the guidance-value field. Stamp duty is charged on the higher of transaction value and guidance value, so leaving it out falls back to the transaction price rather than understating duty.
- Removed the conversion explainer captions from the extent and price inputs.

## 2026-07-29 21:45 IST · Coordinate precision fix, image weight, map text

- Fixed: latitude and longitude inputs had step="0.0001", so the six decimals a dropped pin writes were rejected as invalid and the form refused to submit. Coordinates are continuous, so there is no step to enforce.
- Listing photos are compressed in the browser before upload (about 200 KB at 1600px), using the same helper the partner capture form already used. Full-size phone photos were being stored and served as-is.
- Card images asked for a full-viewport image to fill a 390px card, so each one downloaded roughly three times the pixels it displayed. Sizes corrected and quality set.
- Corridor map: place names lightened again and the frame pulled back further.

## 2026-07-29 21:10 IST · RTC values become appliable, scan is kept

- Reading an RTC now stores the scan itself against the listing, not just what was read off it — the extraction is a proposal about a legal document and a reviewer needs the document to check it against. A link to the stored scan appears in the Legal step.
- Hobli, taluk, district, mutation reference, RTC valid-from, land revenue and owner-on-record are now real property fields, so every value the RTC reader returns can be applied instead of sitting there as reference.
- Owner on record is stored but flagged internal: vendor identity is never rendered on a buyer-facing page.
- Add Property's Location step is two columns — fields left, a smaller sticky map right — so the pin and the address fields are side by side rather than stacked.
- These are all inside the existing `legal` jsonb column, so no migration is needed for them.

## 2026-07-29 20:20 IST · Measured distance, auto FID, multi-step Add Property

- Add Property is now a five-step panel (Location, Pricing, Land, Media, Records) with its own header and a Save button in the bar. Only a title is required, so a part-filled listing can be saved and finished later.
- Distance from Bengaluru is measured from the pin via OSRM road routing rather than estimated by the model, with drive time when available and an explicit fallback label when only a straight line could be computed.
- FID is assigned automatically at creation — the lowest number not in use, so deleting a farm frees its number.
- Images and videos are upload-only; the paste-a-URL fields are gone.
- Pin research also proposes a listing title, and applying it fills the slug.
- Apply all is now a primary button above the suggestion list.

## 2026-07-29 19:05 IST · Explore app shell, drag rails, motion, homepage polish

- Explore is now a fixed-height app shell: the page itself does not scroll, only the listing column does. Title scrolls away, search and filters stay. Map pinned on the right.
- Featured and Our Geography are drag-scrollable rails — grab with a mouse, throw with a trackpad, snap per card. A drag no longer triggers the card's link on release.
- Featured rail had snap-start on its children but no snap type on the scroller, so it parked mid-card and looked like a half-loaded image. Fixed.
- Property cards: shadow tightened. At 60px blur the shadows of adjacent cards merged into one pale panel that read as a stray container behind the row.
- Property cards guard against a listing that has no photo yet, instead of handing next/image an undefined src.
- Corridor map heat blooms pulse on a slow, shallow, per-ring offset cycle. Suppressed under prefers-reduced-motion.
- Lenis smooth scrolling added, kept away from Leaflet and from every self-scrolling rail, and skipped entirely under prefers-reduced-motion.
- Homepage: infrastructure list is now ruled items in two columns rather than bullets, with no numbering. Map height dropped, caption paragraph removed, hero CTA no longer full width on mobile.

## 2026-07-29 17:50 IST · Map legibility, pin-by-link, table and capture fixes

- Corridor map: place names split onto their own tile layer so they can be darkened enough to read against the warm background, without turning every hamlet solid black. Section is now an even 50/50 split, the map is taller, and on mobile it sits above the copy.
- Corridor map: Leaflet's panes were outranking the sticky header (z-index 400+ vs 50), so an open popup painted over it. The map wrapper now creates its own stacking context.
- Explore map: one place-name chip per area instead of one per plot, plus zoom-aware collision culling — any chip that would touch one already placed is demoted to a dot and reappears as you zoom in. Chips restyled flat and small.
- Add property: the map is embedded directly in the assist panel. Drop a pin, or paste a Google Maps link (including the shortened share links, resolved server-side) and the coordinates fill themselves in. "Read this pin" is disabled until a pin exists, so the "set latitude first" error can no longer fire repeatedly.
- Assist panel stripped to its two actions; the explanatory paragraph is gone.
- Field capture now has the map picker too, not just latitude and longitude boxes, plus a link out to the pin in Google Maps.
- Admin properties table: price column no longer wraps ("Rs 89.10 L" was breaking across two lines). Explicit column widths, right-aligned tabular numerals, truncating title and corridor.

## 2026-07-29 16:35 IST · Multi-step capture, map emphasis, hero subtext

- Quick capture is now four optional steps: site (photos, pin, notes), tags, property details (area, extent in gunta/acre/sq ft, price, soil, land observation, water, fencing, electricity) and documents (survey number, khata, RTC scan). Only step one matters; the save button sits outside the stepper so the twenty-second path in a field is unchanged.
- Captures carry tags and a partial-details payload, so anything known on site no longer has to be retyped into the property form later.
- RTC scans can be photographed straight into a capture, and read with the same Sonnet 5 extraction used on the property form. The full reading is stored so a reviewer can audit it against the scan.
- Corridor map: heat blooms roughly doubled in reach and weighted harder towards the centre; the map now frames the three projects rather than the city and every listing, so the blooms are the subject.
- Corridor map: no labels at rest. Clicking a project, the city or a listing area opens its label; the airport's "Site not yet finalised." clause rides along in its popup.
- Homepage: "Discover. Own. Build. Grow." added as hero subtext.
- Homepage: removed the "Why South Bangalore, why now" section — it walked through the same three projects the map section above already covers. The component still ships for use elsewhere.
- User-facing: no visible change to the public capture form's quick path; new optional steps only.
- Requires migration 0012 for capture tags and details.

## 2026-07-29 15:40 IST · Homepage order, region maps, flexible extent, AI assist

- Homepage: removed the two hero sub-paragraphs; Featured land now sits third, directly after the corridor map, with the corridor argument moved below it as supporting evidence.
- Corridor map: centred with even padding on all four sides (the old proportional pad left the region off-centre), rounded corners, and Leaflet's white attribution bar replaced by a plain credit line under the map. Carto and OSM are still credited.
- Our Geography: each region with a verified pin now shows a small map thumbnail built from raster tiles rather than a Leaflet instance. Maralavadi, Kalanakuppe, Sheetalwadi and Bannerghatta have no reliable coordinate yet and stay as plain chips rather than getting an invented pin.
- Add property: extent can be entered in guntas, acres or sq ft, with the other two following live. Acres stays the stored unit.
- Add property: new "Land observation" field for terrain (flat, gently sloping, rocky in patches), with suggestions but free text.
- Properties can now carry optional walkthrough videos, uploaded to the existing CDN-backed Storage bucket. Uploads are stored as-is with no transcoding step; server action body limit raised to 64 MB.
- New AI assist panel on the property form: researches a dropped pin using Claude Sonnet 5 with web search, and reads Kannada RTC documents to extract survey number, village, hobli, taluk, owner and acre-gunta extent. Every value arrives as a proposal with its own Apply button; nothing is written to the form or published automatically.
- User-facing: property pages now show extent in guntas, acres and sq ft, the land observation, and a walkthrough video section when a listing has one.
- Requires `ANTHROPIC_API_KEY` in .env.local and Vercel, and migration 0011 run in Supabase.

## 2026-07-28 18:15 IST · Phase 3: partner capture and QC queue

**`/partner/capture`, built for a broker standing in a field on 4G.**
Single column, thumb reachable, one required step and one optional one. Step 1
is mobile, relationship to the land, a pin (map tap or current location), area,
asking price and 3 to 10 photos. Everything else is behind an "Add more detail"
disclosure that a partner or an agent can finish later.

- **Losing signal must not lose work.** The draft autosaves every 10 seconds, on
  every field blur, and when the page is hidden. A "Saved" indicator says which
  of those three states it is actually in, including "Not saved".
- **Photos are compressed in the browser first.** A phone camera produces 4 to
  8MB a shot, so ten of them is a 60MB upload that never finishes on 4G. Long
  edge is capped at 1600px and quality steps down a ladder until the file fits
  roughly 200KB, which turns that into about 2MB total.
- **Real upload progress.** supabase-js gives no progress events, and a stalled
  upload with no feedback looks the same as a frozen page, so uploads go over
  XHR to the storage REST endpoint. Each photo shows its own bar and a retry
  button if it fails.

**`/partner` dashboard** lists only that partner's own submissions with a status
pill and, when rejected, the reason. Nothing else: no other listings, no buyers.

**`/admin/queue`** is the QC queue. Pending submissions newest first with photo
thumbnails, then a detail view with every submitted field side by side with a
map. Approve opens an enrichment form that requires corridor, road access,
water, soil quality, a point of contact and suitability scores for all seven use
cases before it will go through.

**Approval is one Postgres transaction.** `approve_submission()` mints the FID,
creates the plot, writes the suitability rows, copies media across and closes
the submission. Supabase's client cannot run a multi-statement transaction, so
doing this from application code would leave a window where an FID exists with
no plot, or a plot exists with no photos. **An FID is never generated on
submission, only on approval.**

**The KYC gate is enforced in three places, not one.** A partner cannot submit
until their mobile is verified (the submissions insert policy checks it, and so
does `open_or_create_draft`). Their first plot cannot go live until documents
are checked and they are marked verified (`approve_submission` raises if not).
The UI shows exactly which of those is blocking them, in their words.

**Partner onboarding is self-serve.** Confirming a mobile number promotes the
profile from buyer to partner and sets kyc_status to otp_verified in one step,
so a new broker is not stuck waiting for an admin before they can even start.
The promotion happens in a trigger, and the profiles self-update policy still
pins role and kyc_status, so it cannot be self-granted.

**Storage:** two private buckets. `submissions` holds unvetted partner content
and `kyc` holds identity documents, so neither is public and both are read
through short-lived signed URLs. Partners write only into a folder named for
their own submission id, checked by joining back to `submissions` rather than
trusting the path.

`lib/schema/capture.ts` holds the field schema as plain data with no React and
no Supabase imports, so a WhatsApp flow can reuse it verbatim instead of drifting
into a second set of questions.

**Verified:** `/partner` and `/partner/capture` redirect to `/login`;
`/admin/queue` redirects to the admin login; tsc, eslint and `next build` all
clean. Every file added in this phase is free of em dashes.

**Not verified end to end**, and it cannot be until the migrations are run and a
partner account exists: the full capture, submit, review, approve loop. See the
notes in `.claude/state/todo.md`.

- `(79cba69)`

## 2026-07-28 16:40 IST · Phase 2: schema and auth

**Migrations, not a hand-pasted file.** `supabase/migrations/` now holds six
numbered files applied in order. The old `schema.sql` was one idempotent blob
pasted into the SQL editor with nothing tracking which environment had run
which version, which is exactly why `agents` and `recces` never reached
production. `supabase/README.md` documents the order and the one-time
super-admin bootstrap.

**New schema:** `profiles` (role, partner_type, kyc_status), `submissions`,
`plots`, `plot_suitability`, `plot_media`, `quiz_responses`, `matches`,
`visits`, `professionals`, `professional_intro_requests`, `audit_log`.

Three constraints do real work rather than documenting intent:
- **FID comes from a sequence**, so concurrent approvals cannot collide and a
  number is never handed out twice. It is minted on approval only.
- **`visits` carries an exclusion constraint** on overlapping time ranges per
  plot, limited to live bookings. Two buyers cannot be booked onto the same
  plot at once even if the application logic loses a race.
- **`submissions` cannot be rejected without a reason**, and a `profiles` row
  must have a `partner_type` if and only if the role is partner.

**RLS on every table, deny by default.** A partner is a supplier, not a member
of the business: they can insert submissions and read or edit only their own
while still open, and have zero read on plots, buyers, or anyone else's
submissions. Agents read all live plots but can only edit ones where they are
POC, and cannot approve or reject. `commission_pct` and `contact_phone` sit on
the professionals table, which is staff-only; buyers read a
`professionals_public` view that does not contain those columns, so a leak
would require adding a column to the view rather than forgetting a filter.
The self-update policy on `profiles` pins `role` and `kyc_status` to their
current values, otherwise a buyer could promote themselves to super_admin.

**Audit log is trigger-only.** No application code inserts into it, so a code
path cannot forget to log or choose not to. Covers plots, submissions, visits,
and role or KYC changes on profiles.

**Supabase Auth wired up:** `/login` with mobile OTP for partners and email
magic link for staff, `/auth/callback`, `/auth/redirect` (server decides the
landing route from the role, the client cannot guess it), and `/auth/signout`.
`getSessionProfile()` uses `getUser()` rather than `getSession()`, so
authorization never trusts a client-controlled cookie payload.

**Middleware guards** `/admin` (super_admin), `/agent` (agent and above) and
`/partner` (partner and above). `/partner` is Supabase-only. `/admin` and
`/agent` accept a Supabase session first and fall back to the existing shared
password and standalone agent accounts, so the running product does not lose
access mid-rebuild. Those fallbacks are removed in Phase 7 when both surfaces
move onto the new schema.

**Verified:** `/login` 200; `/admin` and `/agent` still redirect to their
existing logins (no regression); `/partner` and `/partner/capture` redirect to
the new login. tsc, eslint and `next build` all clean.

**Not done yet, deliberately:** the `lib/store/*` modules still use the
service-role key, which bypasses RLS. They move onto per-user clients as each
surface is rebuilt in Phases 3 and 7. Running the migrations does not change
the live site, because nothing reads the new tables yet.

- `(1617769)`

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
