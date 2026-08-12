-- AMES Food Advisory — Supabase schema
-- Run this once in: Supabase Dashboard > SQL Editor > New query
-- The app uses the anon key with no login (single-user), so RLS is enabled
-- with permissive anon policies for these two tables.

create table if not exists public.records (
  id text primary key,
  collection text not null,
  payload jsonb not null default '[]'::jsonb,
  saved_at timestamptz not null default now()
);

create table if not exists public.sync_state (
  id integer primary key,
  last_pull_at timestamptz
);

alter table public.records enable row level security;
alter table public.sync_state enable row level security;

drop policy if exists "anon_select_records" on public.records;
create policy "anon_select_records" on public.records
  for select using (true);

drop policy if exists "anon_insert_records" on public.records;
create policy "anon_insert_records" on public.records
  for insert with check (true);

drop policy if exists "anon_update_records" on public.records;
create policy "anon_update_records" on public.records
  for update using (true);

drop policy if exists "anon_select_sync_state" on public.sync_state;
create policy "anon_select_sync_state" on public.sync_state
  for select using (true);

drop policy if exists "anon_insert_sync_state" on public.sync_state;
create policy "anon_insert_sync_state" on public.sync_state
  for insert with check (true);

drop policy if exists "anon_update_sync_state" on public.sync_state;
create policy "anon_update_sync_state" on public.sync_state
  for update using (true);
