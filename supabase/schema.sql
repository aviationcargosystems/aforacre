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
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists properties_featured_idx on properties (featured) where featured = true;
create index if not exists properties_corridor_idx on properties (corridor);
create index if not exists properties_tags_idx on properties using gin (tags);

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

-- ── Grants ────────────────────────────────────────────────────────────────
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;

-- so any table/sequence/function added later in this schema gets the same grant automatically
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on functions to service_role;
