-- MasSync: Task Completions Table (for recurring tasks)
-- Run this in the SQL Editor of your Supabase project dashboard.
-- Safe to run: uses IF NOT EXISTS – won't delete any existing data.

-- ==========================================
-- Task Completions (tracks each weekly check-in per recurring task)
-- ==========================================
create table if not exists public.task_completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade,
  pair_id uuid references public.pairs(id) on delete cascade,
  completed_by uuid references public.users(id) on delete cascade,
  week_key text not null,  -- ISO week e.g. "2026-W22"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.task_completions enable row level security;

drop policy if exists "Allow members to read pair task completions" on public.task_completions;
create policy "Allow members to read pair task completions"
  on public.task_completions for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and pair_id = task_completions.pair_id
    )
  );

drop policy if exists "Allow members to insert pair task completions" on public.task_completions;
create policy "Allow members to insert pair task completions"
  on public.task_completions for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid() and pair_id = task_completions.pair_id
    )
  );

drop policy if exists "Allow members to delete own task completions" on public.task_completions;
create policy "Allow members to delete own task completions"
  on public.task_completions for delete
  to authenticated
  using (completed_by = auth.uid());

-- Enable Realtime
alter publication supabase_realtime add table public.task_completions;
