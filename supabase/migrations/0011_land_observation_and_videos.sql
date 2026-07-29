-- Land observation and walkthrough videos on properties.
--
-- land_observation: what the plot looks like standing on it (flat, gently
-- sloping, rocky in patches). Soil type describes what is under the surface and
-- extent describes how much there is; neither answers whether a buyer can build
-- without levelling first, which is usually their first question.
--
-- videos: optional walkthrough clips, stored in the same CDN-backed Storage
-- bucket as images. Most listings will have none, so the column defaults to an
-- empty array rather than being nullable in practice.
--
-- Idempotent, matching the convention in every migration in this directory.

alter table properties
  add column if not exists land_observation text not null default '';

alter table properties
  add column if not exists videos text[] not null default '{}';

comment on column properties.land_observation is
  'Free-text terrain note, e.g. "Flat land, gentle fall to the south-east".';

comment on column properties.videos is
  'Public Storage URLs for walkthrough clips. Empty array means no video.';
