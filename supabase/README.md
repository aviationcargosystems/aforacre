# Supabase

## Migrations are the source of truth

`migrations/` holds numbered files applied in order. Run them once each, in
ascending order, in the Supabase SQL editor (or via the Supabase CLI). Never
edit a migration that has already been applied to an environment: add a new one.

| File | What it adds |
| --- | --- |
| `0001_roles_and_profiles.sql` | Role/partner/KYC enums, `profiles`, the RLS helper functions, auto-profile-on-signup trigger |
| `0002_submissions_and_plots.sql` | `submissions`, `plots`, `plot_suitability`, `plot_media`, and the FID sequence |
| `0003_quiz_matches_visits.sql` | `quiz_responses`, `matches`, `visits` with the no-double-booking exclusion constraint |
| `0004_professionals.sql` | `professionals` (with internal-only commission and phone) and `professional_intro_requests` |
| `0005_audit_log.sql` | `audit_log` and the triggers that are the only way to write to it |
| `0006_rls_policies.sql` | RLS on every table, per-role policies, the `professionals_public` view, and grants |

## Bootstrapping the first super admin

The signup trigger gives every new auth user the `buyer` role, so the first
admin has to be promoted deliberately. Sign in once at `/login` with your work
email, then run this against the database with the service role:

```sql
update profiles set role = 'super_admin' where id = (
  select id from auth.users where email = 'you@example.com'
);
```

Mobile OTP needs an SMS provider configured under Authentication > Providers in
the Supabase dashboard. Without one, the email path still works and partners
cannot sign in.

## `schema.sql` is the old world

`schema.sql` describes the pre-rebuild tables (`properties`, `tags`, `captures`,
`enquiries`, `land_submissions`, `agents`, `recces`). Those tables are still
live and still serve the current public site and admin, so the file stays until
Phase 7 moves those surfaces onto `plots` and friends. Do not run it and the
migrations expecting one to supersede the other yet; they describe two schemas
that currently coexist.

`seed.sql` seeds the old `properties` and `tags` tables only.
