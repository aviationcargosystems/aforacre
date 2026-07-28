-- 0006 Row Level Security
--
-- Every table is deny-by-default: RLS on, and access exists only where a
-- policy grants it. The rule that shapes most of this file is that a partner
-- is a supplier, not a member of the business. Brokers never see buyers, never
-- see other partners' submissions, and never see the plots table at all.

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

-- ---------------------------------------------------------------- profiles
create policy profiles_read_own on profiles
  for select using (id = auth.uid());

create policy profiles_update_own on profiles
  for update using (id = auth.uid())
  -- Without this, a buyer could promote themselves to super_admin by updating
  -- their own row. Role and kyc_status are super_admin territory.
  --
  -- These read through the security definer helpers rather than a subquery on
  -- profiles. A policy on profiles that selects from profiles recurses, and
  -- Postgres aborts the query with "infinite recursion detected in policy".
  with check (
    id = auth.uid()
    and role = current_role_of_user()
    and kyc_status = current_kyc_of_user()
  );

create policy profiles_read_all_admin on profiles
  for select using (is_super_admin());

create policy profiles_write_all_admin on profiles
  for all using (is_super_admin()) with check (is_super_admin());

-- Agents need to resolve the POC name on a plot or visit, nothing more.
create policy profiles_read_staff_for_agents on profiles
  for select using (is_agent_or_above() and role in ('agent', 'super_admin'));

-- ------------------------------------------------------------- submissions
create policy submissions_insert_own on submissions
  for insert with check (
    submitted_by = auth.uid()
    and current_role_of_user() = 'partner'
    -- KYC gate, enforced in the database rather than only in the form: a
    -- partner cannot submit until their mobile is verified.
    and current_kyc_of_user() in ('otp_verified', 'docs_submitted', 'verified')
  );

create policy submissions_read_own on submissions
  for select using (submitted_by = auth.uid());

-- Once submitted, a partner can no longer edit. Approved and rejected rows are
-- the record of a decision and must not move under the reviewer.
create policy submissions_update_own_while_open on submissions
  for update using (submitted_by = auth.uid() and status in ('draft', 'pending'))
  with check (submitted_by = auth.uid() and status in ('draft', 'pending'));

create policy submissions_read_staff on submissions
  for select using (is_agent_or_above());

-- Approve and reject are super_admin only. Agents can read the queue but not
-- act on it.
create policy submissions_write_admin on submissions
  for all using (is_super_admin()) with check (is_super_admin());

-- ------------------------------------------------------------------- plots
-- Public inventory. Anonymous browsing is the normal case for a buyer.
create policy plots_read_live on plots
  for select using (status = 'live');

create policy plots_read_staff on plots
  for select using (is_agent_or_above());

create policy plots_update_own_poc on plots
  for update using (current_role_of_user() = 'agent' and poc_id = auth.uid())
  with check (current_role_of_user() = 'agent' and poc_id = auth.uid());

create policy plots_write_admin on plots
  for all using (is_super_admin()) with check (is_super_admin());

-- Suitability and media follow their plot's visibility exactly.
create policy plot_suitability_read on plot_suitability
  for select using (
    exists (select 1 from plots p where p.id = plot_id and (p.status = 'live' or is_agent_or_above()))
  );

create policy plot_suitability_write_admin on plot_suitability
  for all using (is_super_admin()) with check (is_super_admin());

create policy plot_media_read on plot_media
  for select using (
    exists (select 1 from plots p where p.id = plot_id and (p.status = 'live' or is_agent_or_above()))
  );

create policy plot_media_write_admin on plot_media
  for all using (is_super_admin()) with check (is_super_admin());

-- ------------------------------------------------ quiz responses and matches
create policy quiz_responses_read_own on quiz_responses
  for select using (buyer_id = auth.uid());

create policy quiz_responses_read_admin on quiz_responses
  for select using (is_super_admin());

create policy quiz_responses_insert_own on quiz_responses
  for insert with check (buyer_id is null or buyer_id = auth.uid());

create policy matches_read_own on matches
  for select using (
    exists (
      select 1 from quiz_responses q
      where q.id = quiz_response_id and q.buyer_id = auth.uid()
    )
  );

create policy matches_read_admin on matches
  for select using (is_super_admin());

-- ------------------------------------------------------------------ visits
create policy visits_read_own on visits
  for select using (buyer_id = auth.uid());

create policy visits_insert_own on visits
  for insert with check (buyer_id = auth.uid());

create policy visits_read_own_poc on visits
  for select using (current_role_of_user() = 'agent' and poc_id = auth.uid());

create policy visits_write_admin on visits
  for all using (is_super_admin()) with check (is_super_admin());

-- ----------------------------------------------------------- professionals
-- No buyer policy at all. commission_pct and contact_phone live on this table,
-- so the table itself is staff-only and buyers read professionals_public
-- instead (defined below), which does not contain those columns.
create policy professionals_read_staff on professionals
  for select using (is_agent_or_above());

create policy professionals_write_admin on professionals
  for all using (is_super_admin()) with check (is_super_admin());

create policy intro_requests_insert_anyone on professional_intro_requests
  for insert with check (buyer_id is null or buyer_id = auth.uid());

create policy intro_requests_read_admin on professional_intro_requests
  for select using (is_super_admin());

create policy intro_requests_write_admin on professional_intro_requests
  for all using (is_super_admin()) with check (is_super_admin());

-- --------------------------------------------------------------- audit log
-- No insert policy: rows arrive only through the security definer trigger in
-- 0005, which is not subject to these policies. Nothing can forge an entry.
create policy audit_log_read_admin on audit_log
  for select using (is_super_admin());

-- ----------------------------------------------------- public professionals
-- A view rather than column grants, because it is far easier to audit: if a
-- column is not listed here, it cannot reach a buyer. Views run with the
-- owner's rights by default, so this deliberately reads past the staff-only
-- policy above while exposing only safe columns.
create view professionals_public as
  select id, name, category, corridors, rating, review_count
  from professionals
  where is_active;

-- ------------------------------------------------------------------ grants
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
grant usage, select on sequence fid_seq to service_role;

alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on functions to service_role;
