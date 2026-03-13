-- ─── public.profiles table ───────────────────────────────────────────────────
-- Run this script once in the Supabase SQL editor.
-- Idempotent: all statements use IF NOT EXISTS / OR REPLACE / DO NOTHING guards.

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role         TEXT        NOT NULL DEFAULT 'user'
                           CHECK (role IN ('user', 'host', 'admin')),
  first_name   TEXT,
  last_name    TEXT,
  avatar_url   TEXT,
  phone        TEXT,
  nationality  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Helper function — avoids infinite recursion inside RLS policies
--    by reading the role directly via auth.uid() without going through profiles RLS.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 4. RLS policies

-- Users can read their own profile
DROP POLICY IF EXISTS "users_read_own_profile"   ON public.profiles;
CREATE POLICY "users_read_own_profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile (initial creation from client)
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;
CREATE POLICY "users_insert_own_profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read all profiles (needed for admin dashboard host lookups)
DROP POLICY IF EXISTS "admins_read_all_profiles" ON public.profiles;
CREATE POLICY "admins_read_all_profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- 5. Trigger: auto-create a profile row on new auth.users signup
--    Reads first_name / last_name from auth metadata if present.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
