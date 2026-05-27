-- MasSync: Add photos array column to public.memories table
-- Run this in the SQL Editor of your Supabase project dashboard.
-- Safe to run: uses IF NOT EXISTS – won't delete any existing data.

ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}'::text[];
