-- ============================================================
-- Texas Permit Tracker — Supabase SQL Schema
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- PERMITS TABLE
-- ------------------------------------------------------------
create table if not exists public.permits (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  permit_number    text not null,
  city_county      text not null,
  status           text not null default 'Pending'
                     check (status in ('Pending', 'Approved', 'Delayed', 'Rejected', 'Expired')),
  date_submitted   date not null,
  expiration_date  date not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Automatically keep updated_at current
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger permits_updated_at
  before update on public.permits
  for each row execute procedure public.set_updated_at();

-- Index for fast per-user queries
create index if not exists permits_user_id_idx on public.permits(user_id);
create index if not exists permits_status_idx   on public.permits(status);

-- ------------------------------------------------------------
-- NOTES TABLE
-- ------------------------------------------------------------
create table if not exists public.notes (
  id         uuid primary key default uuid_generate_v4(),
  permit_id  uuid not null references public.permits(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  content    text not null check (char_length(content) > 0),
  created_by text not null,          -- display name / email snapshot
  created_at timestamptz not null default now()
);

create index if not exists notes_permit_id_idx on public.notes(permit_id);
create index if not exists notes_user_id_idx   on public.notes(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Permits
alter table public.permits enable row level security;

-- Users can only see their own permits
create policy "permits: select own"
  on public.permits for select
  using (auth.uid() = user_id);

-- Users can only insert permits for themselves
create policy "permits: insert own"
  on public.permits for insert
  with check (auth.uid() = user_id);

-- Users can only update their own permits
create policy "permits: update own"
  on public.permits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can only delete their own permits
create policy "permits: delete own"
  on public.permits for delete
  using (auth.uid() = user_id);

-- Notes
alter table public.notes enable row level security;

-- A user can read notes on permits they own
create policy "notes: select own permit"
  on public.notes for select
  using (
    exists (
      select 1 from public.permits p
      where p.id = permit_id
        and p.user_id = auth.uid()
    )
  );

-- A user can add notes to permits they own
create policy "notes: insert own permit"
  on public.notes for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.permits p
      where p.id = permit_id
        and p.user_id = auth.uid()
    )
  );

-- A user can update only their own notes
create policy "notes: update own"
  on public.notes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- A user can delete only their own notes
create policy "notes: delete own"
  on public.notes for delete
  using (auth.uid() = user_id);
