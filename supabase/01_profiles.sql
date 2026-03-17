-- ─────────────────────────────────────────────────────────────────────────────
-- 01_profiles.sql
-- User profile table — 1-to-1 with auth.users.
-- Depends on: 00_helpers.sql
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name    TEXT,
  last_name     TEXT,

  -- Capability flag: 'user' for regular accounts, 'admin' for platform operators.
  -- 'host' is intentionally removed — host capability is now expressed through
  -- active_mode, not a static role. Admins retain full access to /admin.
  role          TEXT        NOT NULL DEFAULT 'user'
                            CHECK (role IN ('user', 'admin')),

  -- Current active mode — controls which dashboard and features the user sees.
  -- Any authenticated non-admin user may switch freely between modes.
  -- 'tourist' : explore & book mode (default)
  -- 'host'    : property management mode (enables /dashboard and /host/new)
  active_mode   TEXT        NOT NULL DEFAULT 'tourist'
                            CHECK (active_mode IN ('tourist', 'host')),

  avatar_url    TEXT,
  phone         TEXT,
  nationality   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_role_idx        ON public.profiles (role);
CREATE INDEX IF NOT EXISTS profiles_active_mode_idx ON public.profiles (active_mode);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  full_name_text TEXT;
  name_parts     TEXT[];
  derived_first  TEXT;
  derived_last   TEXT;
  part_count     INTEGER;
BEGIN
  full_name_text := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  name_parts := string_to_array(trim(full_name_text), ' ');
  part_count := COALESCE(array_length(name_parts, 1), 0);

  derived_first := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'first_name', ''),
    CASE WHEN part_count >= 1 THEN NULLIF(name_parts[1], '') ELSE NULL END
  );

  derived_last := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'last_name', ''),
    CASE
      WHEN part_count >= 2 THEN NULLIF(array_to_string(name_parts[2:part_count], ' '), '')
      ELSE NULL
    END
  );

  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    role,
    active_mode,
    avatar_url,
    phone,
    nationality,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    derived_first,
    derived_last,
    'user',
    'tourist',   -- every new user starts in Tourist mode
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'nationality',
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
CREATE POLICY "profiles_read_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_read_authenticated" ON public.profiles;
CREATE POLICY "profiles_read_authenticated"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_admin_read_all" ON public.profiles;
CREATE POLICY "profiles_admin_read_all"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "profiles_admin_update_all" ON public.profiles;
CREATE POLICY "profiles_admin_update_all"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());