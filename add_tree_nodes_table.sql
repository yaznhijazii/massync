-- MasSync: Add Tree Nodes Table
-- Run this in the SQL Editor of your Supabase project dashboard.
-- Safe to run: uses IF NOT EXISTS and won't delete any existing data.

-- ==========================================
-- Tree Nodes Table (Inner Circles)
-- ==========================================
create table if not exists public.tree_nodes (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid references public.pairs(id) on delete cascade,
  owner_id uuid references public.users(id) on delete cascade,  -- which user owns this node (me vs partner)
  name text not null,
  relationship text not null,
  category text not null default 'family', -- 'family', 'friends'
  note text,
  avatar text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tree_nodes enable row level security;

drop policy if exists "Allow members to read pair tree nodes" on public.tree_nodes;
create policy "Allow members to read pair tree nodes"
  on public.tree_nodes for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and pair_id = tree_nodes.pair_id
    )
  );

drop policy if exists "Allow members to insert pair tree nodes" on public.tree_nodes;
create policy "Allow members to insert pair tree nodes"
  on public.tree_nodes for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid() and pair_id = tree_nodes.pair_id
    )
  );

drop policy if exists "Allow members to delete pair tree nodes" on public.tree_nodes;
create policy "Allow members to delete pair tree nodes"
  on public.tree_nodes for delete
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and pair_id = tree_nodes.pair_id
    )
  );

-- Enable Realtime for tree_nodes
alter publication supabase_realtime add table public.tree_nodes;
