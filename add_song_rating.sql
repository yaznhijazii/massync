-- Alter songs table to add rating column
alter table public.songs add column if not exists rating integer;
