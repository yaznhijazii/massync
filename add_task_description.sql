-- MasSync: Add description column to tasks table
-- Run this query in the SQL Editor of your Supabase dashboard:
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS description text;
