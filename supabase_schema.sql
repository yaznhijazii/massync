-- MasSync Database Schema Setup
-- Run this in the SQL Editor of your Supabase project dashboard.

-- Drop triggers, functions and policies if they already exist (safe to drop and recreate, does not drop tables)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.generate_invite_code();
drop function if exists public.link_friend(text);
drop function if exists public.disconnect_friend();

-- 1. Create PAIRS Table (IF NOT EXISTS to preserve data)
create table if not exists public.pairs (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid,
  user_b_id uuid,
  status text not null default 'pending', -- 'pending', 'active'
  friends_since date, -- Date when the friendship started
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create USERS Table (IF NOT EXISTS to preserve data)
create table if not exists public.users (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  display_name text,
  avatar_url text, -- Store emoji or URL or storage link
  city text,
  vibe_status text, -- Store user's current vibe status text/emoji
  pair_id uuid references public.pairs(id) on delete set null,
  invite_code text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Complete pairs references now that users is created (wrapped in DO block for safety)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pairs_user_a') THEN
    alter table public.pairs add constraint fk_pairs_user_a foreign key (user_a_id) references public.users(id) on delete set null;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pairs_user_b') THEN
    alter table public.pairs add constraint fk_pairs_user_b foreign key (user_b_id) references public.users(id) on delete set null;
  END IF;
END $$;

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.pairs enable row level security;

-- Policies for USERS
drop policy if exists "Allow authenticated users to read profiles" on public.users;
create policy "Allow authenticated users to read profiles"
  on public.users for select
  to authenticated
  using (true);

drop policy if exists "Allow users to update their own profile" on public.users;
create policy "Allow users to update their own profile"
  on public.users for update
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Allow users to insert their own profile" on public.users;
create policy "Allow users to insert their own profile"
  on public.users for insert
  to authenticated
  with check (auth.uid() = id);

-- Policies for PAIRS
drop policy if exists "Allow members of pair to read the pair record" on public.pairs;
create policy "Allow members of pair to read the pair record"
  on public.pairs for select
  to authenticated
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);

drop policy if exists "Allow members of pair to update the pair record" on public.pairs;
create policy "Allow members of pair to update the pair record"
  on public.pairs for update
  to authenticated
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);


-- 3. Automatic invite code generation
create or replace function public.generate_invite_code()
returns text as $$
declare
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := 'MAS-';
  i integer;
  code_exists boolean;
begin
  loop
    result := 'MAS-';
    for i in 1..4 loop
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    end loop;
    
    -- Check if unique in users table
    select exists(select 1 from public.users where invite_code = result) into code_exists;
    exit when not code_exists;
  end loop;
  return result;
end;
$$ language plpgsql security definer;


-- 4. Auth trigger function for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, display_name, city, invite_code, avatar_url, vibe_status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', 'You'),
    coalesce(new.raw_user_meta_data->>'city', 'Amman, JO'),
    public.generate_invite_code(),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'vibe_status', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Attach trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 5. Linking function for pairing
create or replace function public.link_friend(friend_code text)
returns uuid as $$
declare
  friend_id uuid;
  new_pair_id uuid;
  current_user_id uuid := auth.uid();
begin
  -- Get current user's profile and check if they are already paired
  if exists (
    select 1 from public.users 
    where id = current_user_id and pair_id is not null
  ) then
    raise exception 'You are already paired with someone.';
  end if;

  -- Find friend by invite code (case-insensitive)
  select id into friend_id 
  from public.users 
  where upper(invite_code) = upper(friend_code);

  if friend_id is null then
    raise exception 'Invalid invite code. Please check and try again.';
  end if;

  if friend_id = current_user_id then
    raise exception 'You cannot pair with yourself.';
  end if;

  -- Check if friend is already paired
  if exists (
    select 1 from public.users 
    where id = friend_id and pair_id is not null
  ) then
    raise exception 'This user is already paired with someone else.';
  end if;

  -- Create the pair record
  insert into public.pairs (user_a_id, user_b_id, status)
  values (friend_id, current_user_id, 'active')
  returning id into new_pair_id;

  -- Update both user profiles with the new pair ID
  update public.users 
  set pair_id = new_pair_id 
  where id = current_user_id or id = friend_id;

  return new_pair_id;
end;
$$ language plpgsql security definer;


-- 6. Disconnecting function
create or replace function public.disconnect_friend()
returns void as $$
declare
  current_user_id uuid := auth.uid();
  user_pair_id uuid;
begin
  -- Get current user's pair ID
  select pair_id into user_pair_id 
  from public.users 
  where id = current_user_id;

  if user_pair_id is null then
    raise exception 'You are not currently paired.';
  end if;

  -- Set pair_id to null for both users in the pair
  update public.users 
  set pair_id = null 
  where pair_id = user_pair_id;

  -- Delete the pair record
  delete from public.pairs 
  where id = user_pair_id;
end;
$$ language plpgsql security definer;


-- ==========================================
-- Optional App Data Tables (Scoped to pair_id)
-- ==========================================

-- Tasks Table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid references public.pairs(id) on delete cascade,
  created_by uuid references public.users(id) on delete set null,
  title text not null,
  category text not null default 'shared', -- 'personal', 'shared'
  recurrence text not null default 'none', -- 'none', 'daily', 'weekly'
  is_done boolean not null default false,
  done_by uuid references public.users(id) on delete set null,
  done_at timestamp with time zone,
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tasks enable row level security;

drop policy if exists "Allow members to read pair tasks" on public.tasks;
create policy "Allow members to read pair tasks"
  on public.tasks for select
  to authenticated
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() and pair_id = tasks.pair_id
    )
  );

drop policy if exists "Allow members to insert pair tasks" on public.tasks;
create policy "Allow members to insert pair tasks"
  on public.tasks for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users 
      where id = auth.uid() and pair_id = tasks.pair_id
    )
  );

drop policy if exists "Allow members to update pair tasks" on public.tasks;
create policy "Allow members to update pair tasks"
  on public.tasks for update
  to authenticated
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() and pair_id = tasks.pair_id
    )
  );

drop policy if exists "Allow members to delete pair tasks" on public.tasks;
create policy "Allow members to delete pair tasks"
  on public.tasks for delete
  to authenticated
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() and pair_id = tasks.pair_id
    )
  );


-- Memories Table
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid references public.pairs(id) on delete cascade,
  created_by uuid references public.users(id) on delete set null,
  date date not null default current_date,
  title text not null,
  note text,
  mood_emoji text,
  tags text[],
  photo text, -- URL
  type text not null default 'memory', -- 'memory', 'outing'
  time text, -- for outing
  place text, -- for outing
  vibe text, -- for outing
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.memories enable row level security;

drop policy if exists "Allow members to read pair memories" on public.memories;
create policy "Allow members to read pair memories"
  on public.memories for select
  to authenticated
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() and pair_id = memories.pair_id
    )
  );

drop policy if exists "Allow members to insert pair memories" on public.memories;
create policy "Allow members to insert pair memories"
  on public.memories for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users 
      where id = auth.uid() and pair_id = memories.pair_id
    )
  );

drop policy if exists "Allow members to update pair memories" on public.memories;
create policy "Allow members to update pair memories"
  on public.memories for update
  to authenticated
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() and pair_id = memories.pair_id
    )
  );

drop policy if exists "Allow members to delete pair memories" on public.memories;
create policy "Allow members to delete pair memories"
  on public.memories for delete
  to authenticated
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() and pair_id = memories.pair_id
    )
  );

-- Songs Table
create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid references public.pairs(id) on delete cascade,
  gifted_by uuid references public.users(id) on delete set null,
  title text not null,
  artist text not null,
  message text,
  gifted_at date not null default current_date
);

alter table public.songs enable row level security;

drop policy if exists "Allow members to manage pair songs" on public.songs;
create policy "Allow members to manage pair songs"
  on public.songs for all
  to authenticated
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() and pair_id = songs.pair_id
    )
  );

-- Prayer Logs Table
create table if not exists public.prayer_logs (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid references public.pairs(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  date date not null default current_date,
  fajr boolean not null default false,
  dhuhr boolean not null default false,
  asr boolean not null default false,
  maghrib boolean not null default false,
  isha boolean not null default false,
  unique(user_id, date)
);

alter table public.prayer_logs enable row level security;

drop policy if exists "Allow members to manage prayer logs" on public.prayer_logs;
create policy "Allow members to manage prayer logs"
  on public.prayer_logs for all
  to authenticated
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() and pair_id = prayer_logs.pair_id
    )
  );

-- Ensure vibe_status and friends_since columns exist in case user is upgrading an older DB schema
alter table public.users add column if not exists vibe_status text;
alter table public.pairs add column if not exists friends_since date;

-- ==========================================
-- Supabase Storage Setup (Avatars Bucket)
-- ==========================================

-- Initialize the avatars bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage policies for the avatars bucket
drop policy if exists "Allow public read access on avatars" on storage.objects;
create policy "Allow public read access on avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Allow authenticated users to upload avatars" on storage.objects;
create policy "Allow authenticated users to upload avatars"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars');

drop policy if exists "Allow users to update their own avatars" on storage.objects;
create policy "Allow users to update their own avatars"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars');

drop policy if exists "Allow users to delete their own avatars" on storage.objects;
create policy "Allow users to delete their own avatars"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars');

-- ==========================================
-- Supabase Storage Setup (Memories Bucket)
-- ==========================================

-- Initialize the memories bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('memories', 'memories', true)
on conflict (id) do nothing;

-- Storage policies for the memories bucket
drop policy if exists "Allow public read access on memories" on storage.objects;
create policy "Allow public read access on memories"
  on storage.objects for select
  using (bucket_id = 'memories');

drop policy if exists "Allow authenticated users to upload memories" on storage.objects;
create policy "Allow authenticated users to upload memories"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'memories');

drop policy if exists "Allow users to update their own memories" on storage.objects;
create policy "Allow users to update their own memories"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'memories');

drop policy if exists "Allow users to delete their own memories" on storage.objects;
create policy "Allow users to delete their own memories"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'memories');
