-- 0004 Professionals
--
-- Rebuilt from the old public directory, which leaked the margin layer: it
-- published ratings and phone numbers, so anyone could route around us. Two
-- columns here are internal only and must never reach a client payload:
-- commission_pct and contact_phone. The RLS policies in 0006 deny the table
-- outright to everyone below agent, and the data layer selects an explicit
-- public column list rather than "*".

create table professionals (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  category       text not null default '',
  corridors      text[] not null default '{}',
  rating         numeric(2, 1) not null default 0 check (rating between 0 and 5),
  review_count   int not null default 0 check (review_count >= 0),
  commission_pct numeric(5, 2) not null default 0 check (commission_pct >= 0),
  contact_phone  text not null default '',
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index professionals_category_idx on professionals (category);
create index professionals_active_idx on professionals (is_active) where is_active;
create index professionals_corridors_idx on professionals using gin (corridors);

drop trigger if exists professionals_set_updated_at on professionals;
create trigger professionals_set_updated_at
  before update on professionals
  for each row execute function set_updated_at();

-- "Request an introduction" creates one of these instead of handing over a
-- phone number. We make the intro, so we keep the relationship.
create table professional_intro_requests (
  id              uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals (id) on delete cascade,
  buyer_id        uuid references profiles (id) on delete set null,
  session_id      text not null default '',
  plot_id         uuid references plots (id) on delete set null,
  note            text not null default '',
  handled         boolean not null default false,
  created_at      timestamptz not null default now()
);

create index professional_intro_requests_handled_idx
  on professional_intro_requests (handled, created_at desc);
