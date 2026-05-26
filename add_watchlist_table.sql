-- MasSync: Add Watchlist Table
-- Run this in the SQL Editor of your Supabase project dashboard.
-- Safe to run: uses IF NOT EXISTS and won't delete any existing data.

-- ==========================================
-- Watchlist Table (Movies, Shows & Bucket List)
-- ==========================================
create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid references public.pairs(id) on delete cascade,
  added_by uuid references public.users(id) on delete set null,
  type text not null default 'watch',       -- 'watch' | 'bucket'
  title text not null,
  category text not null default 'Movie',   -- e.g. 'Movie', 'Series', 'Travel'
  status text not null default 'Want to Watch', -- 'Want to Watch' | 'Watching' | 'Done' | 'Pending' | 'Completed'
  rating integer,                            -- 1-5 optional
  priority text,                             -- 'High' | 'Medium' | 'Low' (for bucket list)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.watchlist enable row level security;

drop policy if exists "Allow members to read pair watchlist" on public.watchlist;
create policy "Allow members to read pair watchlist"
  on public.watchlist for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and pair_id = watchlist.pair_id
    )
  );

drop policy if exists "Allow members to insert pair watchlist" on public.watchlist;
create policy "Allow members to insert pair watchlist"
  on public.watchlist for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid() and pair_id = watchlist.pair_id
    )
  );

drop policy if exists "Allow members to update pair watchlist" on public.watchlist;
create policy "Allow members to update pair watchlist"
  on public.watchlist for update
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and pair_id = watchlist.pair_id
    )
  );

drop policy if exists "Allow members to delete pair watchlist" on public.watchlist;
create policy "Allow members to delete pair watchlist"
  on public.watchlist for delete
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and pair_id = watchlist.pair_id
    )
  );

-- Enable Realtime for watchlist
alter publication supabase_realtime add table public.watchlist;
