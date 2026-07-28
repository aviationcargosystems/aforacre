-- =====================================================================
-- A for Acre: full setup, migrations 0001 through 0008 in one file
--
-- Paste this whole file into Supabase > SQL Editor and run it once.
-- It is safe to run more than once: every object is guarded, so a partial
-- failure can be fixed and the file re-run without cleaning up by hand.
--
-- READ THIS BEFORE RUNNING
--
--  1. ONE RENAME HAPPENS. The old professionals table (the public services
--     directory that was removed from the product) still occupies that name.
--     This file renames it to professionals_legacy_backup so the new
--     professionals table can be created. Nothing is deleted. Drop the backup
--     yourself once you are satisfied, with:
--         drop table if exists professionals_legacy_backup;
--
--  2. NOTHING ELSE IS TOUCHED. The existing properties, tags, captures,
--     enquiries, land_submissions, agents and recces tables are left exactly
--     as they are. The live site keeps reading them until Phase 7 moves those
--     surfaces across. Running this does not change what buyers see today.
--
--  3. AFTER RUNNING, two manual steps:
--     a. Turn on an SMS provider under Authentication > Providers, otherwise
--        mobile OTP cannot work and no partner can sign in.
--     b. Sign in once at /login with your work email, then promote yourself:
--            update profiles set role = 'super_admin'
--            where id = (select id from auth.users where email = 'you@example.com');
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------
create extension if not exists pgcrypto;
-- btree_gist lets the visits exclusion constraint compare uuids for equality.
create extension if not exists btree_gist;

-- ---------------------------------------------------------------------
-- Enum types
-- ---------------------------------------------------------------------
do $$ begin create type user_role as enum ('super_admin','agent','partner','buyer');
exception when duplicate_object then null; end $$;

do $$ begin create type partner_type as enum ('broker','reseller','owner');
exception when duplicate_object then null; end $$;

do $$ begin create type kyc_status as enum ('none','otp_verified','docs_submitted','verified','rejected');
exception when duplicate_object then null; end $$;

do $$ begin create type submission_status as enum ('draft','pending','approved','rejected');
exception when duplicate_object then null; end $$;

do $$ begin create type plot_status as enum ('draft','live','on_hold','sold');
exception when duplicate_object then null; end $$;

do $$ begin create type road_access as enum ('tar','mud','none');
exception when duplicate_object then null; end $$;

do $$ begin create type water_source as enum ('borewell_tested','borewell_untested','open_well','none');
exception when duplicate_object then null; end $$;

do $$ begin create type soil_quality as enum ('rich','moderate','poor');
exception when duplicate_object then null; end $$;

do $$ begin create type use_case as enum
  ('polyhouse','commercial','farmhouse','getaway','retirement','investment','organic');
exception when duplicate_object then null; end $$;

do $$ begin create type media_kind as enum ('image','video','doc');
exception when duplicate_object then null; end $$;

do $$ begin create type visit_status as enum ('requested','confirmed','completed','cancelled');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- Free up the professionals name (see warning 1 at the top)
-- ---------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'professionals'
  ) and exists (
    -- Only the OLD table has a slug column. This is how we tell it apart from
    -- the new one, so re-running the file does not rename the new table away.
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'professionals' and column_name = 'slug'
  ) then
    alter table professionals rename to professionals_legacy_backup;
    raise notice 'Renamed old professionals table to professionals_legacy_backup';
  end if;
end $$;

-- ---------------------------------------------------------------------
-- Shared helper: keep updated_at current
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create table if not exists profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  full_name      text not null default '',
  mobile         text not null default '',
  role           user_role not null default 'buyer',
  partner_type   partner_type,
  kyc_status     kyc_status not null default 'none',
  created_at     timestamptz not null default now(),
  last_active_at timestamptz not null default now(),
  constraint profiles_partner_type_matches_role
    check ((role = 'partner') = (partner_type is not null))
);

create index if not exists profiles_role_idx on profiles (role);
create index if not exists profiles_kyc_status_idx on profiles (kyc_status) where kyc_status <> 'verified';

-- Role lookups run inside RLS policies on profiles itself, so a plain subquery
-- would recurse and Postgres would abort with "infinite recursion detected in
-- policy". security definer runs the lookup as the owner, which skips RLS and
-- breaks the cycle. search_path is pinned so the function cannot be redirected.
create or replace function current_role_of_user()
returns user_role language sql stable security definer
set search_path = public, pg_temp as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function current_kyc_of_user()
returns kyc_status language sql stable security definer
set search_path = public, pg_temp as $$
  select kyc_status from profiles where id = auth.uid();
$$;

create or replace function is_super_admin()
returns boolean language sql stable security definer
set search_path = public, pg_temp as $$
  select coalesce(current_role_of_user() = 'super_admin', false);
$$;

create or replace function is_agent_or_above()
returns boolean language sql stable security definer
set search_path = public, pg_temp as $$
  select coalesce(current_role_of_user() in ('agent','super_admin'), false);
$$;

-- Every new auth user gets a profile immediately, so there is never a signed-in
-- user without a role. Defaults to buyer; promotion is a deliberate act.
create or replace function handle_new_auth_user()
returns trigger language plpgsql security definer
set search_path = public, pg_temp as $$
begin
  insert into profiles (id, full_name, mobile)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.phone, new.raw_user_meta_data ->> 'mobile', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();

-- Confirming a mobile number promotes buyer to partner and clears the first
-- KYC step in one move, so a new broker is not stuck waiting for an admin
-- before they can even start. The self-update policy below still pins role and
-- kyc_status, so this cannot be self-granted.
create or replace function handle_phone_confirmed()
returns trigger language plpgsql security definer
set search_path = public, pg_temp as $$
begin
  if new.phone_confirmed_at is not null and old.phone_confirmed_at is null then
    update profiles
      set role = case when role = 'buyer' then 'partner' else role end,
          partner_type = case
            when role = 'buyer' or partner_type is null then 'broker'
            else partner_type
          end,
          kyc_status = case when kyc_status = 'none' then 'otp_verified' else kyc_status end,
          mobile = coalesce(nullif(mobile, ''), new.phone)
      where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_phone_confirmed on auth.users;
create trigger on_auth_phone_confirmed
  after update on auth.users
  for each row execute function handle_phone_confirmed();

-- ---------------------------------------------------------------------
-- submissions
-- ---------------------------------------------------------------------
create table if not exists submissions (
  id            uuid primary key default gen_random_uuid(),
  submitted_by  uuid not null references profiles (id) on delete cascade,
  partner_type  partner_type not null,
  status        submission_status not null default 'draft',
  reject_reason text,
  reviewed_by   uuid references profiles (id) on delete set null,
  reviewed_at   timestamptz,
  payload       jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- A rejection with no reason is useless to the partner staring at it.
  constraint submissions_rejected_needs_reason
    check (status <> 'rejected' or (reject_reason is not null and length(trim(reject_reason)) > 0))
);

create index if not exists submissions_status_idx on submissions (status);
create index if not exists submissions_submitted_by_idx on submissions (submitted_by);
create index if not exists submissions_created_at_idx on submissions (created_at desc);

drop trigger if exists submissions_set_updated_at on submissions;
create trigger submissions_set_updated_at
  before update on submissions for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- plots, suitability, media
-- ---------------------------------------------------------------------
-- FID is the only public identifier for a plot. A sequence gives values that
-- are safe under concurrent approval and never handed out twice. Gaps are fine:
-- the guarantee needed is uniqueness and no reuse, not contiguity.
create sequence if not exists fid_seq as bigint start 1 increment 1 no cycle;

create or replace function next_fid()
returns text language sql volatile as $$
  select 'FID-' || lpad(nextval('fid_seq')::text, 4, '0');
$$;

create table if not exists plots (
  id                 uuid primary key default gen_random_uuid(),
  fid                text not null unique,
  source_submission  uuid references submissions (id) on delete set null,
  title              text not null default '',
  area_acres         numeric(10,2) not null check (area_acres >= 1.0),
  price_total        bigint not null default 0 check (price_total >= 0),
  price_per_acre     bigint not null default 0 check (price_per_acre >= 0),
  corridor           text not null default '',
  village            text not null default '',
  lat                numeric(9,6),
  lng                numeric(9,6),
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

create index if not exists plots_status_idx on plots (status);
create index if not exists plots_corridor_idx on plots (corridor);
create index if not exists plots_poc_id_idx on plots (poc_id);
create index if not exists plots_featured_idx on plots (featured) where featured;
create index if not exists plots_created_at_idx on plots (created_at desc);

drop trigger if exists plots_set_updated_at on plots;
create trigger plots_set_updated_at
  before update on plots for each row execute function set_updated_at();

-- One row per use case per plot. Drives matching and the "why this plot" chips,
-- which is why rationale exists: a score with no explanation cannot become a
-- reason a buyer reads.
create table if not exists plot_suitability (
  plot_id   uuid not null references plots (id) on delete cascade,
  use_case  use_case not null,
  score     int not null check (score between 0 and 100),
  rationale text not null default '',
  primary key (plot_id, use_case)
);

create index if not exists plot_suitability_use_case_score_idx
  on plot_suitability (use_case, score desc);

create table if not exists plot_media (
  id           uuid primary key default gen_random_uuid(),
  plot_id      uuid not null references plots (id) on delete cascade,
  storage_path text not null,
  kind         media_kind not null default 'image',
  sort_order   int not null default 0,
  uploaded_by  uuid references profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists plot_media_plot_id_idx on plot_media (plot_id, sort_order);

-- ---------------------------------------------------------------------
-- quiz responses, matches, visits
-- ---------------------------------------------------------------------
create table if not exists quiz_responses (
  id          uuid primary key default gen_random_uuid(),
  buyer_id    uuid references profiles (id) on delete set null,
  session_id  text not null,
  answers     jsonb not null default '{}'::jsonb,
  persona_key text not null default '',
  computed_at timestamptz not null default now(),
  -- Anonymous is normal, but a row with neither owner could never be claimed.
  constraint quiz_responses_needs_owner
    check (buyer_id is not null or length(trim(session_id)) > 0)
);

create index if not exists quiz_responses_session_id_idx on quiz_responses (session_id);
create index if not exists quiz_responses_buyer_id_idx on quiz_responses (buyer_id);
create index if not exists quiz_responses_computed_at_idx on quiz_responses (computed_at desc);

create table if not exists matches (
  id               uuid primary key default gen_random_uuid(),
  quiz_response_id uuid not null references quiz_responses (id) on delete cascade,
  plot_id          uuid not null references plots (id) on delete cascade,
  score            int not null check (score between 0 and 100),
  reasons          jsonb not null default '[]'::jsonb,
  created_at       timestamptz not null default now(),
  unique (quiz_response_id, plot_id)
);

create index if not exists matches_quiz_response_idx on matches (quiz_response_id, score desc);

create table if not exists visits (
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
  -- Two buyers must never be on the same plot at the same time. The route
  -- builder checks this too, but application checks lose races. This makes a
  -- double booking impossible. Only live bookings reserve the slot, so
  -- cancelling frees it.
  constraint visits_no_double_booking
    exclude using gist (
      plot_id with =,
      tstzrange(slot_start, slot_end) with &&
    ) where (status in ('requested','confirmed'))
);

create index if not exists visits_plot_id_idx on visits (plot_id);
create index if not exists visits_buyer_id_idx on visits (buyer_id);
create index if not exists visits_poc_id_idx on visits (poc_id);
create index if not exists visits_slot_start_idx on visits (slot_start);
create index if not exists visits_route_group_idx on visits (route_group_id) where route_group_id is not null;

drop trigger if exists visits_set_updated_at on visits;
create trigger visits_set_updated_at
  before update on visits for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- professionals
-- ---------------------------------------------------------------------
-- commission_pct and contact_phone are internal only and must never reach a
-- client payload. The table is staff-only and buyers read the view below.
create table if not exists professionals (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  category       text not null default '',
  corridors      text[] not null default '{}',
  rating         numeric(2,1) not null default 0 check (rating between 0 and 5),
  review_count   int not null default 0 check (review_count >= 0),
  commission_pct numeric(5,2) not null default 0 check (commission_pct >= 0),
  contact_phone  text not null default '',
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists professionals_category_idx on professionals (category);
create index if not exists professionals_active_idx on professionals (is_active) where is_active;
create index if not exists professionals_corridors_idx on professionals using gin (corridors);

drop trigger if exists professionals_set_updated_at on professionals;
create trigger professionals_set_updated_at
  before update on professionals for each row execute function set_updated_at();

-- "Request an introduction" creates one of these instead of handing over a
-- phone number. We make the intro, so we keep the relationship.
create table if not exists professional_intro_requests (
  id              uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals (id) on delete cascade,
  buyer_id        uuid references profiles (id) on delete set null,
  session_id      text not null default '',
  plot_id         uuid references plots (id) on delete set null,
  note            text not null default '',
  handled         boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists professional_intro_requests_handled_idx
  on professional_intro_requests (handled, created_at desc);

-- ---------------------------------------------------------------------
-- audit log, written by trigger only
-- ---------------------------------------------------------------------
create table if not exists audit_log (
  id          bigserial primary key,
  actor_id    uuid references profiles (id) on delete set null,
  entity_type text not null,
  entity_id   text not null,
  action      text not null,
  before      jsonb,
  after       jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists audit_log_entity_idx on audit_log (entity_type, entity_id, created_at desc);
create index if not exists audit_log_actor_idx on audit_log (actor_id, created_at desc);
create index if not exists audit_log_created_at_idx on audit_log (created_at desc);

create or replace function write_audit_log()
returns trigger language plpgsql security definer
set search_path = public, pg_temp as $$
declare
  entity text := tg_argv[0];
  row_id text;
  before_data jsonb;
  after_data jsonb;
begin
  if tg_op = 'DELETE' then
    before_data := to_jsonb(old); after_data := null; row_id := old.id::text;
  elsif tg_op = 'INSERT' then
    before_data := null; after_data := to_jsonb(new); row_id := new.id::text;
  else
    before_data := to_jsonb(old); after_data := to_jsonb(new); row_id := new.id::text;
    -- An UPDATE that changed nothing is noise, not history.
    if before_data = after_data then return new; end if;
  end if;

  insert into audit_log (actor_id, entity_type, entity_id, action, before, after)
  values (auth.uid(), entity, row_id, lower(tg_op), before_data, after_data);

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists plots_audit on plots;
create trigger plots_audit after insert or update or delete on plots
  for each row execute function write_audit_log('plot');

drop trigger if exists submissions_audit on submissions;
create trigger submissions_audit after insert or update or delete on submissions
  for each row execute function write_audit_log('submission');

drop trigger if exists visits_audit on visits;
create trigger visits_audit after insert or update or delete on visits
  for each row execute function write_audit_log('visit');

-- Only role and KYC changes are worth auditing on profiles. Logging every
-- last_active_at touch would bury the one event that matters.
create or replace function write_profile_role_audit()
returns trigger language plpgsql security definer
set search_path = public, pg_temp as $$
begin
  if new.role is distinct from old.role or new.kyc_status is distinct from old.kyc_status then
    insert into audit_log (actor_id, entity_type, entity_id, action, before, after)
    values (
      auth.uid(), 'profile', new.id::text, 'update',
      jsonb_build_object('role', old.role, 'kyc_status', old.kyc_status),
      jsonb_build_object('role', new.role, 'kyc_status', new.kyc_status)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_role_audit on profiles;
create trigger profiles_role_audit after update on profiles
  for each row execute function write_profile_role_audit();

-- ---------------------------------------------------------------------
-- Draft helper for the capture form
-- ---------------------------------------------------------------------
create or replace function open_or_create_draft()
returns uuid language plpgsql security definer
set search_path = public, pg_temp as $$
declare
  v_profile profiles;
  v_id uuid;
begin
  select * into v_profile from profiles where id = auth.uid();
  if not found or v_profile.role <> 'partner' then
    raise exception 'only a partner can open a capture draft';
  end if;
  if v_profile.kyc_status = 'none' then
    raise exception 'verify your mobile number before adding land';
  end if;

  select id into v_id from submissions
    where submitted_by = auth.uid() and status = 'draft'
    order by updated_at desc limit 1;

  if v_id is null then
    insert into submissions (submitted_by, partner_type, status)
    values (auth.uid(), coalesce(v_profile.partner_type, 'broker'), 'draft')
    returning id into v_id;
  end if;

  return v_id;
end;
$$;

revoke all on function open_or_create_draft from public, anon;
grant execute on function open_or_create_draft to authenticated;

-- ---------------------------------------------------------------------
-- Approval, as one transaction
-- ---------------------------------------------------------------------
-- Mints the FID, creates the plot, writes suitability, copies media and closes
-- the submission. Supabase's client cannot run a multi-statement transaction,
-- so doing this in application code would leave a window where an FID exists
-- with no plot, or a plot exists with no photos.
create or replace function approve_submission(
  p_submission_id uuid,
  p_title text,
  p_area_acres numeric,
  p_price_total bigint,
  p_corridor text,
  p_village text,
  p_lat numeric,
  p_lng numeric,
  p_road_access road_access,
  p_road_width_ft int,
  p_water water_source,
  p_fencing boolean,
  p_electricity boolean,
  p_existing_structure text,
  p_soil_quality soil_quality,
  p_poc_id uuid,
  p_suitability jsonb
)
returns plots language plpgsql security definer
set search_path = public, pg_temp as $$
declare
  v_submission submissions;
  v_partner profiles;
  v_plot plots;
  v_media jsonb;
  v_item jsonb;
  v_sort int := 0;
begin
  if not is_super_admin() then
    raise exception 'only a super admin can approve a submission';
  end if;

  select * into v_submission from submissions where id = p_submission_id for update;
  if not found then
    raise exception 'submission % not found', p_submission_id;
  end if;
  if v_submission.status <> 'pending' then
    raise exception 'submission % is %, not pending', p_submission_id, v_submission.status;
  end if;

  -- KYC gate, second half: a partner's first plot cannot go live until their
  -- documents have been checked.
  select * into v_partner from profiles where id = v_submission.submitted_by;
  if v_partner.kyc_status <> 'verified' then
    raise exception 'partner % is not KYC verified (currently %)', v_partner.id, v_partner.kyc_status;
  end if;

  if p_area_acres < 1.0 then
    raise exception 'plots must be at least 1 acre, got %', p_area_acres;
  end if;

  insert into plots (
    fid, source_submission, title, area_acres, price_total, price_per_acre,
    corridor, village, lat, lng, road_access, road_width_ft, water, fencing,
    electricity, existing_structure, soil_quality, status, poc_id
  ) values (
    next_fid(), p_submission_id, p_title, p_area_acres, p_price_total,
    case when p_area_acres > 0 then round(p_price_total / p_area_acres) else 0 end,
    p_corridor, p_village, p_lat, p_lng, p_road_access, p_road_width_ft, p_water,
    coalesce(p_fencing, false), coalesce(p_electricity, false), p_existing_structure,
    p_soil_quality, 'live', p_poc_id
  )
  returning * into v_plot;

  -- Suitability arrives as [{"use_case":"...","score":0,"rationale":"..."}].
  for v_item in select * from jsonb_array_elements(coalesce(p_suitability, '[]'::jsonb))
  loop
    insert into plot_suitability (plot_id, use_case, score, rationale)
    values (
      v_plot.id,
      (v_item ->> 'use_case')::use_case,
      (v_item ->> 'score')::int,
      coalesce(v_item ->> 'rationale', '')
    )
    on conflict (plot_id, use_case) do update
      set score = excluded.score, rationale = excluded.rationale;
  end loop;

  -- Media paths live in the submission payload until approval promotes them.
  v_media := coalesce(v_submission.payload -> 'images', '[]'::jsonb);
  for v_item in select * from jsonb_array_elements(v_media)
  loop
    insert into plot_media (plot_id, storage_path, kind, sort_order, uploaded_by)
    values (v_plot.id, v_item #>> '{}', 'image', v_sort, v_submission.submitted_by);
    v_sort := v_sort + 1;
  end loop;

  update submissions
    set status = 'approved', reviewed_by = auth.uid(), reviewed_at = now(), reject_reason = null
    where id = p_submission_id;

  return v_plot;
end;
$$;

revoke all on function approve_submission from public, anon;
grant execute on function approve_submission to authenticated, service_role;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
-- Deny by default everywhere: RLS on, and access exists only where a policy
-- grants it. The rule shaping most of this is that a partner is a supplier,
-- not a member of the business.
alter table profiles enable row level security;
alter table submissions enable row level security;
alter table plots enable row level security;
alter table plot_suitability enable row level security;
alter table plot_media enable row level security;
alter table quiz_responses enable row level security;
alter table matches enable row level security;
alter table visits enable row level security;
alter table professionals enable row level security;
alter table professional_intro_requests enable row level security;
alter table audit_log enable row level security;

-- profiles
drop policy if exists profiles_read_own on profiles;
create policy profiles_read_own on profiles
  for select using (id = auth.uid());

drop policy if exists profiles_update_own on profiles;
-- Reads through the security definer helpers, not a subquery on profiles: a
-- policy on profiles that selects from profiles recurses and Postgres aborts
-- with "infinite recursion detected in policy". Without pinning role and
-- kyc_status here, a buyer could promote themselves to super_admin.
create policy profiles_update_own on profiles
  for update using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = current_role_of_user()
    and kyc_status = current_kyc_of_user()
  );

drop policy if exists profiles_read_all_admin on profiles;
create policy profiles_read_all_admin on profiles
  for select using (is_super_admin());

drop policy if exists profiles_write_all_admin on profiles;
create policy profiles_write_all_admin on profiles
  for all using (is_super_admin()) with check (is_super_admin());

drop policy if exists profiles_read_staff_for_agents on profiles;
create policy profiles_read_staff_for_agents on profiles
  for select using (is_agent_or_above() and role in ('agent','super_admin'));

-- submissions
drop policy if exists submissions_insert_own on submissions;
create policy submissions_insert_own on submissions
  for insert with check (
    submitted_by = auth.uid()
    and current_role_of_user() = 'partner'
    -- KYC gate, first half: no submitting until the mobile is verified.
    and current_kyc_of_user() in ('otp_verified','docs_submitted','verified')
  );

drop policy if exists submissions_read_own on submissions;
create policy submissions_read_own on submissions
  for select using (submitted_by = auth.uid());

-- Once submitted, a partner can no longer edit. Approved and rejected rows are
-- the record of a decision and must not move under the reviewer.
drop policy if exists submissions_update_own_while_open on submissions;
create policy submissions_update_own_while_open on submissions
  for update using (submitted_by = auth.uid() and status in ('draft','pending'))
  with check (submitted_by = auth.uid() and status in ('draft','pending'));

drop policy if exists submissions_read_staff on submissions;
create policy submissions_read_staff on submissions
  for select using (is_agent_or_above());

-- Approve and reject are super_admin only. Agents read the queue, cannot act.
drop policy if exists submissions_write_admin on submissions;
create policy submissions_write_admin on submissions
  for all using (is_super_admin()) with check (is_super_admin());

-- plots
drop policy if exists plots_read_live on plots;
create policy plots_read_live on plots
  for select using (status = 'live');

drop policy if exists plots_read_staff on plots;
create policy plots_read_staff on plots
  for select using (is_agent_or_above());

drop policy if exists plots_update_own_poc on plots;
create policy plots_update_own_poc on plots
  for update using (current_role_of_user() = 'agent' and poc_id = auth.uid())
  with check (current_role_of_user() = 'agent' and poc_id = auth.uid());

drop policy if exists plots_write_admin on plots;
create policy plots_write_admin on plots
  for all using (is_super_admin()) with check (is_super_admin());

-- Suitability and media follow their plot's visibility exactly.
drop policy if exists plot_suitability_read on plot_suitability;
create policy plot_suitability_read on plot_suitability
  for select using (
    exists (select 1 from plots p where p.id = plot_id and (p.status = 'live' or is_agent_or_above()))
  );

drop policy if exists plot_suitability_write_admin on plot_suitability;
create policy plot_suitability_write_admin on plot_suitability
  for all using (is_super_admin()) with check (is_super_admin());

drop policy if exists plot_media_read on plot_media;
create policy plot_media_read on plot_media
  for select using (
    exists (select 1 from plots p where p.id = plot_id and (p.status = 'live' or is_agent_or_above()))
  );

drop policy if exists plot_media_write_admin on plot_media;
create policy plot_media_write_admin on plot_media
  for all using (is_super_admin()) with check (is_super_admin());

-- quiz responses and matches
drop policy if exists quiz_responses_read_own on quiz_responses;
create policy quiz_responses_read_own on quiz_responses
  for select using (buyer_id = auth.uid());

drop policy if exists quiz_responses_read_admin on quiz_responses;
create policy quiz_responses_read_admin on quiz_responses
  for select using (is_super_admin());

drop policy if exists quiz_responses_insert_own on quiz_responses;
create policy quiz_responses_insert_own on quiz_responses
  for insert with check (buyer_id is null or buyer_id = auth.uid());

drop policy if exists matches_read_own on matches;
create policy matches_read_own on matches
  for select using (
    exists (select 1 from quiz_responses q where q.id = quiz_response_id and q.buyer_id = auth.uid())
  );

drop policy if exists matches_read_admin on matches;
create policy matches_read_admin on matches
  for select using (is_super_admin());

-- visits
drop policy if exists visits_read_own on visits;
create policy visits_read_own on visits
  for select using (buyer_id = auth.uid());

drop policy if exists visits_insert_own on visits;
create policy visits_insert_own on visits
  for insert with check (buyer_id = auth.uid());

drop policy if exists visits_read_own_poc on visits;
create policy visits_read_own_poc on visits
  for select using (current_role_of_user() = 'agent' and poc_id = auth.uid());

drop policy if exists visits_write_admin on visits;
create policy visits_write_admin on visits
  for all using (is_super_admin()) with check (is_super_admin());

-- professionals
-- No buyer policy at all: commission_pct and contact_phone live here, so the
-- table is staff-only and buyers read professionals_public instead.
drop policy if exists professionals_read_staff on professionals;
create policy professionals_read_staff on professionals
  for select using (is_agent_or_above());

drop policy if exists professionals_write_admin on professionals;
create policy professionals_write_admin on professionals
  for all using (is_super_admin()) with check (is_super_admin());

drop policy if exists intro_requests_insert_anyone on professional_intro_requests;
create policy intro_requests_insert_anyone on professional_intro_requests
  for insert with check (buyer_id is null or buyer_id = auth.uid());

drop policy if exists intro_requests_read_admin on professional_intro_requests;
create policy intro_requests_read_admin on professional_intro_requests
  for select using (is_super_admin());

drop policy if exists intro_requests_write_admin on professional_intro_requests;
create policy intro_requests_write_admin on professional_intro_requests
  for all using (is_super_admin()) with check (is_super_admin());

-- audit log: no insert policy, because rows arrive only through the security
-- definer trigger above, which is not subject to these policies.
drop policy if exists audit_log_read_admin on audit_log;
create policy audit_log_read_admin on audit_log
  for select using (is_super_admin());

-- A view rather than column grants, because it is easier to audit: if a column
-- is not listed here, it cannot reach a buyer.
create or replace view professionals_public as
  select id, name, category, corridors, rating, review_count
  from professionals
  where is_active;

-- ---------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on plots, plot_suitability, plot_media, professionals_public to anon, authenticated;
grant select, insert on quiz_responses to anon, authenticated;
grant select on matches to anon, authenticated;
grant insert on professional_intro_requests to anon, authenticated;

grant select, update on profiles to authenticated;
grant select, insert, update on submissions to authenticated;
grant select, insert on visits to authenticated;
grant select on professionals to authenticated;
grant select on audit_log to authenticated;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;

alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on functions to service_role;

commit;

-- ---------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------
-- Deliberately a second transaction. Creating policies on storage.objects
-- needs privileges the SQL editor usually has but not always. If this part
-- fails, everything above is already committed rather than rolled back, and
-- only the buckets need sorting out (they can also be created in the dashboard
-- under Storage, both set to private).
begin;

-- Neither is public: submissions holds unvetted partner content and kyc holds
-- identity documents, so both are read through short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('submissions','submissions',false), ('kyc','kyc',false)
on conflict (id) do nothing;

-- Ownership is checked by joining back to submissions, not by trusting the path.
drop policy if exists "partners upload own submission media" on storage.objects;
create policy "partners upload own submission media"
  on storage.objects for insert
  with check (
    bucket_id = 'submissions'
    and exists (
      select 1 from submissions s
      where s.id::text = (storage.foldername(name))[1]
        and s.submitted_by = auth.uid()
        and s.status in ('draft','pending')
    )
  );

drop policy if exists "partners read own submission media" on storage.objects;
create policy "partners read own submission media"
  on storage.objects for select
  using (
    bucket_id = 'submissions'
    and exists (
      select 1 from submissions s
      where s.id::text = (storage.foldername(name))[1]
        and s.submitted_by = auth.uid()
    )
  );

drop policy if exists "partners delete own draft media" on storage.objects;
create policy "partners delete own draft media"
  on storage.objects for delete
  using (
    bucket_id = 'submissions'
    and exists (
      select 1 from submissions s
      where s.id::text = (storage.foldername(name))[1]
        and s.submitted_by = auth.uid()
        and s.status = 'draft'
    )
  );

drop policy if exists "staff read submission media" on storage.objects;
create policy "staff read submission media"
  on storage.objects for select
  using (bucket_id = 'submissions' and is_agent_or_above());

-- A partner may upload their own KYC documents and never read anything back.
drop policy if exists "partners upload own kyc" on storage.objects;
create policy "partners upload own kyc"
  on storage.objects for insert
  with check (bucket_id = 'kyc' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "super admin reads kyc" on storage.objects;
create policy "super admin reads kyc"
  on storage.objects for select
  using (bucket_id = 'kyc' and is_super_admin());

commit;

-- =====================================================================
-- Done. Two manual steps remain, see the header:
--   1. Authentication > Providers: enable an SMS provider for mobile OTP.
--   2. Sign in at /login with your work email, then promote yourself:
--        update profiles set role = 'super_admin'
--        where id = (select id from auth.users where email = 'you@example.com');
-- =====================================================================
