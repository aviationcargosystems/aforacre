-- Optional property detail on a capture.
--
-- A capture used to be photos, a pin and a note. That stays the whole
-- requirement: somebody standing in a field on 4G should be able to finish in
-- twenty seconds. But when the person capturing already knows the extent, the
-- price, the survey number or has the RTC in hand, making them come back later
-- and retype it into the property form is wasted work and a second chance to
-- mistype it.
--
-- `details` is jsonb rather than twenty nullable columns because these fields
-- are optional, partially filled, and only ever read as a block when an admin
-- promotes the capture into a listing. Giving each one a column would mean a
-- migration every time the capture form gains a field.

alter table captures
  add column if not exists tags text[] not null default '{}';

alter table captures
  add column if not exists details jsonb not null default '{}'::jsonb;

comment on column captures.tags is
  'Brand tags picked in the field, carried over when the capture is promoted to a property.';

comment on column captures.details is
  'Optional partial property fields (extent, pricing, land observation, legal, RTC extraction). Everything in here is unverified field input.';
