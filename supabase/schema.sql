-- A for Acre — Supabase schema
-- Run this once in Supabase → SQL Editor (Project → SQL Editor → New query → paste → Run).
-- Safe to re-run: every statement is idempotent (IF NOT EXISTS / CREATE OR REPLACE).

create extension if not exists pgcrypto; -- for gen_random_uuid()

-- ── properties ────────────────────────────────────────────────────────────
create table if not exists properties (
  slug                        text primary key,
  title                       text not null,
  area                        text not null,
  corridor                    text not null,
  lat                         double precision not null,
  lng                         double precision not null,
  extent_acres                numeric not null,
  price_per_acre              bigint not null,
  total_price                 bigint not null,
  tags                        text[] not null default '{}',
  journey_fit                 jsonb not null default '{}'::jsonb, -- {polyhouse, commercial-farming, retirement, getaway}
  soil_type                   text not null,
  water_sources               text[] not null default '{}',
  road_access                 text not null,
  fencing                     boolean not null default false,
  electricity                 boolean not null default false,
  images                      text[] not null default '{}',
  description                 text not null default '',
  taxes                       jsonb not null default '{}'::jsonb,  -- computed TaxBreakdown, recomputed on every save
  suitability                 jsonb not null default '{}'::jsonb,  -- computed LandSuitability, recomputed on every save
  legal                       jsonb not null default '{}'::jsonb,  -- LegalStatus
  nearby_landmarks            text[] not null default '{}',
  distance_from_bangalore_km  numeric not null default 0,
  featured                    boolean not null default false,
  fid                         text unique, -- "Farm ID" shown as "FID 0042" — admin-assigned on approval, not seller-chosen
  verified                    jsonb not null default '{"ownership":false,"survey":false,"gps":false,"physicalInspection":false,"roadAccess":false,"documents":false}'::jsonb,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- Existing databases created before fid/verified existed won't get them from
-- `create table if not exists` above (that only runs once) — add explicitly.
alter table properties add column if not exists fid text;
alter table properties add column if not exists verified jsonb not null default '{"ownership":false,"survey":false,"gps":false,"physicalInspection":false,"roadAccess":false,"documents":false}'::jsonb;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'properties_fid_key') then
    alter table properties add constraint properties_fid_key unique (fid);
  end if;
end $$;

create index if not exists properties_featured_idx on properties (featured) where featured = true;
create index if not exists properties_corridor_idx on properties (corridor);
create index if not exists properties_tags_idx on properties using gin (tags);
create index if not exists properties_fid_idx on properties (fid);

-- ── professionals ─────────────────────────────────────────────────────────
create table if not exists professionals (
  slug                text primary key,
  name                text not null,
  category            text not null,
  tagline             text not null default '',
  services            text[] not null default '{}',
  starting_price      text not null default '',
  experience_years    integer not null default 0,
  projects_completed  integer not null default 0,
  service_areas       text[] not null default '{}',
  rating              numeric not null default 0,
  review_count        integer not null default 0,
  image               text not null default '',
  bio                 text not null default '',
  phone               text not null default '',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists professionals_category_idx on professionals (category);

-- ── tags ──────────────────────────────────────────────────────────────────
-- Canonical pickable tag list shown on the property form — separate from the
-- tags actually attached to properties (properties.tags), so a tag can exist
-- here before/after it's used on any listing.
create table if not exists tags (
  name  text primary key
);

-- ── captures ──────────────────────────────────────────────────────────────
create table if not exists captures (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  images                text[] not null default '{}',
  lat                   double precision,
  lng                   double precision,
  location_accuracy_m   double precision,
  label                 text not null default '',
  notes                 text not null default '',
  captured_by           text not null default '',
  property_slug         text references properties(slug) on delete set null,
  status                text not null default 'new' check (status in ('new', 'reviewed', 'archived'))
);

create index if not exists captures_status_idx on captures (status);
create index if not exists captures_created_at_idx on captures (created_at desc);

-- ── enquiries ─────────────────────────────────────────────────────────────
-- Simple lead capture (name + phone) — used by the quiz's "no strong match"
-- fallback, the property page's "Request a call back", the professional
-- page's "Request a quote", and "Schedule a visit".
create table if not exists enquiries (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  name           text not null default '',
  phone          text not null,
  context        text not null default '', -- e.g. "quiz", "schedule-visit", "property", "professional"
  property_slug  text references properties(slug) on delete set null,
  message        text not null default '',
  status         text not null default 'new' check (status in ('new', 'contacted', 'closed'))
);

create index if not exists enquiries_status_idx on enquiries (status);
create index if not exists enquiries_created_at_idx on enquiries (created_at desc);

-- ── land_submissions ──────────────────────────────────────────────────────
-- Public "Submit Land" intake from owners/resellers/brokers. Admin reviews,
-- edits if needed, and approves — approval assigns a FID and creates the
-- live `properties` row.
create table if not exists land_submissions (
  id                        uuid primary key default gen_random_uuid(),
  created_at                timestamptz not null default now(),
  images                    text[] not null default '{}',
  videos                    text[] not null default '{}',
  area                      text not null default '',
  lat                       double precision,
  lng                       double precision,
  extent_gunta              numeric,
  extent_acres              numeric,
  expected_price_per_gunta  bigint,
  owner_name                text not null default '',
  owner_type                text not null default 'owner' check (owner_type in ('broker', 'reseller', 'owner')),
  phone                     text not null,
  tags                      text[] not null default '{}',
  notes                     text not null default '',
  status                    text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  property_slug             text references properties(slug) on delete set null
);

create index if not exists land_submissions_status_idx on land_submissions (status);
create index if not exists land_submissions_created_at_idx on land_submissions (created_at desc);

-- ── agents ────────────────────────────────────────────────────────────────
-- Field agents (A for Acre staff) who do recces. Separate identity tier from
-- the single shared /admin password: per-person credentials, so recce work is
-- attributable. `password_hash` is "salt:derivedKey" hex from node:crypto
-- scrypt (see src/lib/agent-auth.ts) — never a plain or reversible value.
create table if not exists agents (
  id             uuid primary key default gen_random_uuid(),
  name           text not null default '',
  phone          text not null default '',
  username       text not null unique,
  password_hash  text not null,
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists agents_username_idx on agents (username);
create index if not exists agents_active_idx on agents (active) where active = true;

-- ── recces ────────────────────────────────────────────────────────────────
-- An assigned site survey. Distinct from `captures` (ad-hoc, no lifecycle):
-- a recce is created by an admin, assigned to one agent, and moves through a
-- status flow. Three kinds:
--   scout        — survey unlisted land (property_slug is null)
--   pre_visit    — verify an already-listed plot before a client sees it
--   client_visit — agent is the on-site POC for a booked visit
-- Client contact details are deliberately NOT stored here: agents must not see
-- them (source doc: brokers/agents don't talk to clients directly).
create table if not exists recces (
  id             uuid primary key default gen_random_uuid(),
  type           text not null default 'scout' check (type in ('scout', 'pre_visit', 'client_visit')),
  status         text not null default 'assigned' check (status in ('assigned', 'in_progress', 'submitted', 'approved', 'rejected')),
  agent_id       uuid references agents(id) on delete set null,
  property_slug  text references properties(slug) on delete set null,
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
  updated_at     timestamptz not null default now()
);

create index if not exists recces_status_idx on recces (status);
create index if not exists recces_agent_id_idx on recces (agent_id);
create index if not exists recces_created_at_idx on recces (created_at desc);

-- ── keep updated_at current ──────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists properties_set_updated_at on properties;
create trigger properties_set_updated_at
  before update on properties
  for each row execute function set_updated_at();

drop trigger if exists professionals_set_updated_at on professionals;
create trigger professionals_set_updated_at
  before update on professionals
  for each row execute function set_updated_at();

-- ── Row Level Security ───────────────────────────────────────────────────
-- The app only ever talks to Supabase through the server-side service-role
-- key (src/lib/supabase/server.ts). service_role bypasses RLS *policies*, but
-- still needs ordinary object privileges (GRANT) to touch these tables at
-- all — tables created via the SQL Editor don't inherit Supabase's usual
-- automatic grants the way tables made in the Table Editor UI do, so that's
-- set explicitly below. Enabling RLS with no policies means the anon/public
-- key — even if it ever leaked — grants no access at all; defense in depth,
-- not required for the app to work.
alter table properties enable row level security;
alter table professionals enable row level security;
alter table tags enable row level security;
alter table captures enable row level security;
alter table enquiries enable row level security;
alter table land_submissions enable row level security;

-- ── Grants ────────────────────────────────────────────────────────────────
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;

-- so any table/sequence/function added later in this schema gets the same grant automatically
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on functions to service_role;
