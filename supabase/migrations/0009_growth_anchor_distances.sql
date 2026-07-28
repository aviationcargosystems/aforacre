-- 0009 Growth anchor distances
--
-- Distance from each plot to the three committed public projects that define
-- our selection criteria (see src/lib/anchors.ts). Stored rather than computed
-- per request: the anchors do not move, the plot does not move, and a listing
-- page should not be doing trigonometry on every render.
--
-- Written on create and recomputed on approval. If the second airport site is
-- finalised somewhere other than the current front runner, the anchor
-- coordinate changes and these values must be backfilled.

alter table plots add column if not exists dist_iimb_km numeric(6, 2);
alter table plots add column if not exists dist_stadium_km numeric(6, 2);
alter table plots add column if not exists dist_airport_km numeric(6, 2);

comment on column plots.dist_airport_km is
  'Provisional. Second airport site is not finalised; measured to the Harohalli front runner.';
