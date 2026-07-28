-- 0007 Capture storage buckets and the approval transaction

-- Neither bucket is public. Submission media is unvetted partner content and
-- KYC media is identity documents, so both are read through short-lived signed
-- URLs minted server side rather than being guessable public URLs.
insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false), ('kyc', 'kyc', false)
on conflict (id) do nothing;

-- Partners write into a folder named for their own submission id. The first
-- path segment is the submission id, so ownership is checked by joining back
-- to submissions rather than trusting the path.
create policy "partners upload own submission media"
  on storage.objects for insert
  with check (
    bucket_id = 'submissions'
    and exists (
      select 1 from submissions s
      where s.id::text = (storage.foldername(name))[1]
        and s.submitted_by = auth.uid()
        and s.status in ('draft', 'pending')
    )
  );

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

create policy "staff read submission media"
  on storage.objects for select
  using (bucket_id = 'submissions' and is_agent_or_above());

-- KYC documents: a partner may upload their own and never read anything back.
-- Only super_admin can look at them.
create policy "partners upload own kyc"
  on storage.objects for insert
  with check (bucket_id = 'kyc' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "super admin reads kyc"
  on storage.objects for select
  using (bucket_id = 'kyc' and is_super_admin());

-- ------------------------------------------------------------------ approve
-- Approval mints an FID, creates the plot, copies media across and closes the
-- submission. Supabase's client libraries cannot run a multi-statement
-- transaction, so doing this from application code would leave a window where
-- an FID exists with no plot, or a plot exists with no media. Keeping it in one
-- function makes the whole thing atomic.
--
-- Enrichment values are required arguments rather than optional ones: a plot
-- must not go live missing the fields the match engine scores on.
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
returns plots
language plpgsql
security definer
set search_path = public, pg_temp
as $$
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

  -- KYC gate, second half: a partner's first submission cannot go live until
  -- their documents have been checked and they have been marked verified.
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

  -- Suitability arrives as [{"use_case": "...", "score": 0, "rationale": "..."}].
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
