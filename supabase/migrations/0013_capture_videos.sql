-- Walkthrough clips on a capture.
--
-- A slope, a water channel or the state of an approach road reads on video and
-- does not read in a still. Optional, like the property equivalent, and stored
-- in the same CDN-backed bucket as the photos.
--
-- Idempotent, matching the convention in this directory.

alter table captures
  add column if not exists videos text[] not null default '{}';

comment on column captures.videos is
  'Public Storage URLs for clips taken during the capture. Empty array means none.';
