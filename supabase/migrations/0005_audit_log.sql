-- 0005 Audit log
--
-- Rows are written by trigger only. Nothing in the application inserts here,
-- which is what makes the log trustworthy: a code path cannot forget to log,
-- and cannot choose not to.

create table audit_log (
  id          bigserial primary key,
  actor_id    uuid references profiles (id) on delete set null,
  entity_type text not null,
  entity_id   text not null,
  action      text not null,
  before      jsonb,
  after       jsonb,
  created_at  timestamptz not null default now()
);

create index audit_log_entity_idx on audit_log (entity_type, entity_id, created_at desc);
create index audit_log_actor_idx on audit_log (actor_id, created_at desc);
create index audit_log_created_at_idx on audit_log (created_at desc);

create or replace function write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  entity text := tg_argv[0];
  row_id text;
  before_data jsonb;
  after_data jsonb;
begin
  if tg_op = 'DELETE' then
    before_data := to_jsonb(old);
    after_data := null;
    row_id := old.id::text;
  elsif tg_op = 'INSERT' then
    before_data := null;
    after_data := to_jsonb(new);
    row_id := new.id::text;
  else
    before_data := to_jsonb(old);
    after_data := to_jsonb(new);
    row_id := new.id::text;
    -- An UPDATE that changed nothing is noise, not history.
    if before_data = after_data then
      return new;
    end if;
  end if;

  insert into audit_log (actor_id, entity_type, entity_id, action, before, after)
  values (auth.uid(), entity, row_id, lower(tg_op), before_data, after_data);

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger plots_audit
  after insert or update or delete on plots
  for each row execute function write_audit_log('plot');

create trigger submissions_audit
  after insert or update or delete on submissions
  for each row execute function write_audit_log('submission');

create trigger visits_audit
  after insert or update or delete on visits
  for each row execute function write_audit_log('visit');

-- Only role changes are worth auditing on profiles. Logging every
-- last_active_at touch would bury the one event that actually matters.
create or replace function write_profile_role_audit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.role is distinct from old.role or new.kyc_status is distinct from old.kyc_status then
    insert into audit_log (actor_id, entity_type, entity_id, action, before, after)
    values (
      auth.uid(),
      'profile',
      new.id::text,
      'update',
      jsonb_build_object('role', old.role, 'kyc_status', old.kyc_status),
      jsonb_build_object('role', new.role, 'kyc_status', new.kyc_status)
    );
  end if;
  return new;
end;
$$;

create trigger profiles_role_audit
  after update on profiles
  for each row execute function write_profile_role_audit();
