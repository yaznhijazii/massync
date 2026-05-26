-- Create reminders table
create table if not exists public.reminders (
  id uuid default gen_random_uuid() primary key,
  pair_id uuid not null references public.pairs(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.reminders enable row level security;

-- Policies
create policy "Allow users to read reminders for their pair"
  on public.reminders for select
  using (pair_id = (select pair_id from public.users where id = auth.uid()));

create policy "Allow users to insert reminders for their pair"
  on public.reminders for insert
  with check (pair_id = (select pair_id from public.users where id = auth.uid()));

create policy "Allow users to update/delete reminders for their pair"
  on public.reminders for all
  using (pair_id = (select pair_id from public.users where id = auth.uid()));

-- Add to Realtime publication
alter publication supabase_realtime add table public.reminders;
