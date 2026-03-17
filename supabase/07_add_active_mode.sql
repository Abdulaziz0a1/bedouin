-- ─────────────────────────────────────────────────────────────────────────────
-- 07_add_active_mode.sql
-- Adds the active_mode column to an EXISTING profiles table.
-- Safe to run multiple times (uses IF NOT EXISTS / DO $$ blocks).
--
-- Run this file against any Supabase instance that was created before
-- the active_mode field was part of 01_profiles.sql.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add the column with a safe default
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS active_mode TEXT NOT NULL DEFAULT 'tourist'
    CHECK (active_mode IN ('tourist', 'host'));

-- 2. Backfill: set all existing rows to 'tourist' (they already default,
--    but an explicit update makes intent clear).
UPDATE public.profiles
   SET active_mode = 'tourist'
 WHERE active_mode IS DISTINCT FROM 'tourist';

-- 3. Index for fast dashboard and mode-check lookups
CREATE INDEX IF NOT EXISTS profiles_active_mode_idx ON public.profiles (active_mode);

-- 4. RLS: existing policies already cover the profiles table.
--    active_mode is readable by the owner via "profiles_read_own"
--    and writable by the owner via "profiles_update_own".
--    No new policies are needed — the existing ones are sufficient.
