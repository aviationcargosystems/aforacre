-- 0002 Submissions, plots, suitability, media
--
-- A submission is what a partner sends in. A plot is what we publish. They are
-- separate tables on purpose: a submission can be rejected, edited, or sit in
-- draft forever without ever becoming public inventory, and approving one is
-- an explicit act that mints an FID.

create type submission_status as enum ('draft', 'pending', 'approved', 'rejected');
create type plot_status as enum ('draft', 'live', 'on_hold', 'sold');
create type road_access as enum ('tar', 'mud', 'none');
create type water_source as enum ('borewell_tested', 'borewell_untested', 'open_well', 'none');
create type soil_quality as enum ('rich', 'moderate', 'poor');
create type use_case as enum (
  'polyhouse',
  'commercial',
  'farmhouse',
  'getaway',
  'retirement',
  'investment',
  'organic'
);
create type media_kind as enum ('image', 'video', 'doc');

create table submissions (
  id            uuid primary key default gen_random_uuid(),
  submitted_by  uuid not null references profiles (id) on delete cascade,
  partner_type  partner_type not null,
  status        submission_status not null default 'draft',
  reject_reason text,
  reviewed_by   uuid references profiles (id) on delete set null,
  reviewed_at   timestamptz,
  -- The capture form is deliberately loose: step 1 is required, step 2 can be
  -- filled in later or by an agent. A jsonb payload lets the form evolve
  -- without a migration per field, and it is the same shape lib/schema/capture
  -- describes so a WhatsApp flow can post it verbatim.
  payload       jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- A rejection without a reason is useless to the partner staring at it.
  constraint submissions_rejected_needs_reason
    check (status <> 'rejected' or (reject_reason is not null and length(trim(reject_reason)) > 0))
);

create index submissions_status_idx on submissions (status);
create index submissions_submitted_by_idx on submissions (submitted_by);
create index submissions_created_at_idx on submissions (created_at desc);

drop trigger if exists submissions_set_updated_at on submissions;
create trigger submissions_set_updated_at
  before update on submissions
  for each row execute function set_updated_at();

-- FID is the only public identifier for a plot. A sequence gives sequential
-- values that are safe under concurrent approval and never handed out twice.
-- Gaps are possible if a transaction rolls back, which is fine: the guarantee
-- we need is uniqueness and no reuse, not contiguity.
create sequence fid_seq as bigint start 1 increment 1 no cycle;

create or replace function next_fid()
returns text
language sql
volatile
as $$
  select 'FID-' || lpad(nextval('fid_seq')::text, 4, '0');
$$;

create table plots (
  id                 uuid primary key default gen_random_uuid(),
  fid                text not null unique,
  source_submission  uuid references submissions (id) on delete set null,
  title              text not null default '',
  area_acres         numeric(10, 2) not null check (area_acres >= 1.0),
  price_total        bigint not null default 0 check (price_total >= 0),
  price_per_acre     bigint not null default 0 check (price_per_acre >= 0),
  corridor           text not null default '',
  village            text not null default '',
  lat                numeric(9, 6),
  lng                numeric(9, 6),
  road_access        road_access not null default 'none',
  road_width_ft      int check (road_width_ft is null or road_width_ft >= 0),
  water              water_source not null default 'none',
  fencing            boolean not null default false,
  electricity        boolean not null default false,
  existing_structure text,
  soil_quality       soil_quality not null default 'moderate',
  status             plot_status not null default 'draft',
  poc_id             uuid references profiles (id) on delete set null,
  featured           boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index plots_status_idx on plots (status);
create index plots_corridor_idx on plots (corridor);
create index plots_poc_id_idx on plots (poc_id);
create index plots_featured_idx on plots (featured) where featured;
create index plots_created_at_idx on plots (created_at desc);

drop trigger if exists plots_set_updated_at on plots;
create trigger plots_set_updated_at
  before update on plots
  for each row execute function set_updated_at();

-- One row per use case per plot. Drives both the match engine and the "why
-- this plot" chips, which is why rationale is required: a score with no
-- explanation cannot be turned into a reason a buyer reads.
create table plot_suitability (
  plot_id   uuid not null references plots (id) on delete cascade,
  use_case  use_case not null,
  score     int not null check (score between 0 and 100),
  rationale text not null default '',
  primary key (plot_id, use_case)
);

create index plot_suitability_use_case_score_idx on plot_suitability (use_case, score desc);

create table plot_media (
  id           uuid primary key default gen_random_uuid(),
  plot_id      uuid not null references plots (id) on delete cascade,
  storage_path text not null,
  kind         media_kind not null default 'image',
  sort_order   int not null default 0,
  uploaded_by  uuid references profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);

create index plot_media_plot_id_idx on plot_media (plot_id, sort_order);
