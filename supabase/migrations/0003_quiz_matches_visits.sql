-- 0003 Quiz responses, matches, visits
--
-- Buyers can take the quiz anonymously against a session_id and claim the
-- result later by verifying their mobile, so buyer_id is nullable throughout.

create type visit_status as enum ('requested', 'confirmed', 'completed', 'cancelled');

create table quiz_responses (
  id          uuid primary key default gen_random_uuid(),
  buyer_id    uuid references profiles (id) on delete set null,
  session_id  text not null,
  answers     jsonb not null default '{}'::jsonb,
  persona_key text not null default '',
  computed_at timestamptz not null default now(),

  -- Anonymous responses are the normal case, but a row with neither a buyer
  -- nor a session is unattributable and could never be claimed.
  constraint quiz_responses_needs_owner
    check (buyer_id is not null or length(trim(session_id)) > 0)
);

create index quiz_responses_session_id_idx on quiz_responses (session_id);
create index quiz_responses_buyer_id_idx on quiz_responses (buyer_id);
create index quiz_responses_computed_at_idx on quiz_responses (computed_at desc);

create table matches (
  id               uuid primary key default gen_random_uuid(),
  quiz_response_id uuid not null references quiz_responses (id) on delete cascade,
  plot_id          uuid not null references plots (id) on delete cascade,
  score            int not null check (score between 0 and 100),
  reasons          jsonb not null default '[]'::jsonb,
  created_at       timestamptz not null default now(),

  unique (quiz_response_id, plot_id)
);

create index matches_quiz_response_idx on matches (quiz_response_id, score desc);

create table visits (
  id             uuid primary key default gen_random_uuid(),
  buyer_id       uuid references profiles (id) on delete set null,
  plot_id        uuid not null references plots (id) on delete cascade,
  slot_start     timestamptz not null,
  slot_end       timestamptz not null,
  status         visit_status not null default 'requested',
  route_group_id uuid,
  poc_id         uuid references profiles (id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint visits_slot_ordered check (slot_end > slot_start),

  -- Two buyers must never be standing on the same plot at the same time. The
  -- route builder checks this too, but application-level checks lose races;
  -- this makes a double booking impossible at the database level. Only live
  -- bookings reserve the slot, so cancelling frees it and completed visits do
  -- not block future ones.
  constraint visits_no_double_booking
    exclude using gist (
      plot_id with =,
      tstzrange(slot_start, slot_end) with &&
    ) where (status in ('requested', 'confirmed'))
);

create index visits_plot_id_idx on visits (plot_id);
create index visits_buyer_id_idx on visits (buyer_id);
create index visits_poc_id_idx on visits (poc_id);
create index visits_slot_start_idx on visits (slot_start);
create index visits_route_group_idx on visits (route_group_id) where route_group_id is not null;

drop trigger if exists visits_set_updated_at on visits;
create trigger visits_set_updated_at
  before update on visits
  for each row execute function set_updated_at();
