-- 0001 Roles and profiles
--
-- Start of the Phase 2 rebuild. The old supabase/schema.sql was a single
-- idempotent file pasted by hand into the SQL editor, with nothing tracking
-- which environment had run which version. That is exactly why the agents and
-- recces tables never reached production. From here on, schema changes are
-- numbered migrations applied in order.

create extension if not exists pgcrypto;
-- Needed by the visits exclusion constraint in 0003: gist indexes cannot
-- compare uuids for equality without it.
create extension if not exists btree_gist;

create type user_role as enum ('super_admin', 'agent', 'partner', 'buyer');
create type partner_type as enum ('broker', 'reseller', 'owner');
create type kyc_status as enum ('none', 'otp_verified', 'docs_submitted', 'verified', 'rejected');

-- One row per authenticated user. Supabase owns auth.users; this holds
-- everything the product needs on top of it.
create table profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  full_name      text not null default '',
  mobile         text not null default '',
  role           user_role not null default 'buyer',
  partner_type   partner_type,
  kyc_status     kyc_status not null default 'none',
  created_at     timestamptz not null default now(),
  last_active_at timestamptz not null default now(),

  -- partner_type is meaningless for anyone who is not a partner, and required
  -- for anyone who is. Enforced here so application code cannot drift.
  constraint profiles_partner_type_matches_role
    check ((role = 'partner') = (partner_type is not null))
);

create index profiles_role_idx on profiles (role);
create index profiles_kyc_status_idx on profiles (kyc_status) where kyc_status <> 'verified';

-- Role lookups run inside RLS policies on profiles itself, so a plain
-- "select role from profiles" policy check would recurse. security definer
-- runs the lookup as the function owner, which bypasses RLS and breaks the
-- cycle. search_path is pinned so the function cannot be redirected at a
-- caller-controlled schema.
create or replace function current_role_of_user()
returns user_role
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(current_role_of_user() = 'super_admin', false);
$$;

create or replace function is_agent_or_above()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(current_role_of_user() in ('agent', 'super_admin'), false);
$$;

-- Every new auth user gets a profile immediately, so there is never a signed-in
-- user without a role. Defaults to buyer; promotion is a super_admin action.
create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
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

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
