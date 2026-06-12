-- MasSync: Add Time Blocks Table
-- Run this in the SQL Editor of your Supabase project dashboard.
-- Safe to run: uses IF NOT EXISTS and won't delete any existing data.

-- ==========================================
-- Time Blocks Table (Weekly Time-Blocking)
-- ==========================================
create table if not exists public.time_blocks (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid references public.pairs(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  domain text not null,            -- 'spiritual' | 'work' | 'health' | 'downtime' | 'matches'
  day text not null,               -- 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
  start_time text not null,        -- 'HH:MM' format
  end_time text not null,          -- 'HH:MM' format
  details text,                    -- optional notes / World Cup match details
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.time_blocks enable row level security;

-- SELECT POLICY
drop policy if exists "Allow members to read pair time blocks" on public.time_blocks;
create policy "Allow members to read pair time blocks"
  on public.time_blocks for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and pair_id = time_blocks.pair_id
    )
  );

-- INSERT POLICY
drop policy if exists "Allow members to insert pair time blocks" on public.time_blocks;
create policy "Allow members to insert pair time blocks"
  on public.time_blocks for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid() and pair_id = time_blocks.pair_id
    )
  );

-- UPDATE POLICY
drop policy if exists "Allow members to update pair time blocks" on public.time_blocks;
create policy "Allow members to update pair time blocks"
  on public.time_blocks for update
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and pair_id = time_blocks.pair_id
    )
  );

-- DELETE POLICY
drop policy if exists "Allow members to delete pair time blocks" on public.time_blocks;
create policy "Allow members to delete pair time blocks"
  on public.time_blocks for delete
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and pair_id = time_blocks.pair_id
    )
  );

-- Enable Realtime for time_blocks
alter publication supabase_realtime add table public.time_blocks;
