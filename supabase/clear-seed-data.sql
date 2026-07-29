-- Clear the seeded demo catalogue, ready for real listings.
--
-- READ BEFORE RUNNING. This deletes rows permanently and there is no undo. Take
-- a backup first if there is anything here you would miss (Supabase dashboard →
-- Database → Backups).
--
-- What it deliberately does NOT touch:
--   profiles / auth users  — deleting these locks you out of admin
--   tags                   — your filtering vocabulary, not demo content
--   storage objects        — the seeded images are Unsplash URLs, so there is
--                            nothing of yours to delete; anything you uploaded
--                            stays in the bucket
--
-- Run the whole thing, or comment out any section you want to keep.

begin;

-- Anything referencing a property has to go first, or the delete below fails on
-- a foreign key. Each of these is guarded so the script still runs on a project
-- where that table was never created.
do $$
begin
  if to_regclass('public.visits') is not null then delete from visits; end if;
  if to_regclass('public.matches') is not null then delete from matches; end if;
  if to_regclass('public.quiz_responses') is not null then delete from quiz_responses; end if;
  if to_regclass('public.enquiries') is not null then delete from enquiries; end if;
  if to_regclass('public.recces') is not null then delete from recces; end if;
  if to_regclass('public.captures') is not null then delete from captures; end if;
  if to_regclass('public.land_submissions') is not null then delete from land_submissions; end if;
  if to_regclass('public.submissions') is not null then delete from submissions; end if;
end $$;

delete from properties;

-- FIDs are handed out as the lowest number not in use, so an empty table means
-- the next listing you create is FID-0001. Reset the sequence too, in case
-- anything still reads from it.
do $$
begin
  if to_regclass('public.fid_seq') is not null then
    perform setval('fid_seq', 1, false);
  end if;
end $$;

commit;

-- Confirm it did what you expected before you close the editor.
select
  (select count(*) from properties) as properties,
  (select count(*) from captures)   as captures,
  (select count(*) from tags)       as tags_kept;
