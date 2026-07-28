-- 0008 Partner onboarding
--
-- Signing in by mobile OTP is the partner path: brokers, resellers and owners
-- all reach us from a phone. Confirming that number does two things at once,
-- so the promotion and the first KYC step happen together rather than needing
-- an admin to unblock every new broker before they can even start.
--
-- Their relationship to the land (broker, reseller or owner) is provisional
-- until they say so in the capture form, which writes partner_type back. The
-- profiles self-update policy in 0006 lets them change partner_type but pins
-- role and kyc_status, so this promotion cannot be self-granted.

create or replace function handle_phone_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
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

-- A partner opening the capture form needs a draft to autosave into and to name
-- the storage folder. Reusing an existing open draft stops every visit
-- creating a new empty row.
create or replace function open_or_create_draft()
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
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

  select id into v_id
    from submissions
    where submitted_by = auth.uid() and status = 'draft'
    order by updated_at desc
    limit 1;

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
