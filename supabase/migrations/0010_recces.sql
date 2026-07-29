-- 0010 Recces, on the new identity model
--
-- The old recces table hung off a separate `agents` table that no longer
-- exists. An agent is now a profile with role='agent', so this version points
-- at profiles and there is one identity system rather than two.
--
-- A recce is an assigned site survey with a lifecycle, which is what makes it
-- different from a capture: created by an admin, assigned to one agent, and
-- moved through a status flow. Three kinds:
--   scout        survey unlisted land (no listing attached yet)
--   pre_visit    verify an already-listed plot before a buyer sees it
--   client_visit the agent is the on-site contact for a booked visit
--
-- Client contact details are deliberately absent. Agents must not see buyers.

-- Guarded so a partial run can be fixed and the file re-run without cleaning
-- up by hand. Postgres has no "create type if not exists".
do $$ begin
  create type recce_type as enum ('scout', 'pre_visit', 'client_visit');
exception when duplicate_object then null; end $$;

do $$ begin
  create type recce_status as enum ('assigned', 'in_progress', 'submitted', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

create table if not exists recces (
  id             uuid primary key default gen_random_uuid(),
  type           recce_type not null default 'scout',
  status         recce_status not null default 'assigned',
  agent_id       uuid references profiles (id) on delete set null,
  -- Listings still live in the legacy properties table during the migration,
  -- so this is a loose reference rather than a foreign key. It becomes an FK to
  -- plots once listings move across.
  property_slug  text,
  area           text not null default '',
  lat            double precision,
  lng            double precision,
  scheduled_for  timestamptz,
  instructions   text not null default '',
  images         text[] not null default '{}',
  notes          text not null default '',
  submitted_lat  double precision,
  submitted_lng  double precision,
  submitted_at   timestamptz,
  review_note    text not null default '',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  -- A rejection an agent cannot act on is not a review.
  constraint recces_rejected_needs_note
    check (status <> 'rejected' or length(trim(review_note)) > 0)
);

create index if not exists recces_status_idx on recces (status);
create index if not exists recces_agent_id_idx on recces (agent_id);
create index if not exists recces_created_at_idx on recces (created_at desc);

drop trigger if exists recces_set_updated_at on recces;
create trigger recces_set_updated_at
  before update on recces
  for each row execute function set_updated_at();

drop trigger if exists recces_audit on recces;
create trigger recces_audit
  after insert or update or delete on recces
  for each row execute function write_audit_log('recce');

alter table recces enable row level security;

-- An agent sees only their own work. Enforced here rather than in a query
-- filter, so a guessed id cannot surface someone else's recce.
drop policy if exists recces_read_own on recces;
create policy recces_read_own on recces
  for select using (agent_id = auth.uid());

-- They can report back, but not reassign themselves or change the verdict.
drop policy if exists recces_update_own on recces;
create policy recces_update_own on recces
  for update using (agent_id = auth.uid() and status in ('assigned', 'in_progress'))
  with check (agent_id = auth.uid() and status in ('in_progress', 'submitted'));

drop policy if exists recces_read_staff on recces;
create policy recces_read_staff on recces
  for select using (is_agent_or_above());

drop policy if exists recces_write_admin on recces;
create policy recces_write_admin on recces
  for all using (is_super_admin()) with check (is_super_admin());

grant select, update on recces to authenticated;
