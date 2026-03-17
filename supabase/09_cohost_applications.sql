-- ─────────────────────────────────────────────────────────────────────────────
-- 09_cohost_applications.sql
-- Co-host / service provider applications — users who want to offer services
-- to hosts (check-in management, cleaning, guiding, photography, etc.)
-- Admins review and approve; approved co-hosts become visible on /cohost.
-- Depends on: 00_helpers.sql, 01_profiles.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Step 1: Extend profiles with co-host application status ──────────────────
-- cohost_status:
--   NULL      → user has not applied as a co-host / service provider
--   'pending' → application submitted, awaiting admin review
--   'approved'→ visible on the co-host marketplace
--   'rejected'→ rejected; user can re-apply

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cohost_status
    TEXT CHECK (cohost_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cohost_rejection_reason TEXT;

CREATE INDEX IF NOT EXISTS profiles_cohost_status_idx ON public.profiles (cohost_status);

-- ── Step 2: Co-host applications table ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.cohost_applications (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Service offerings
  -- Values mirror CoHostService type in lib/types/cohost.ts
  service_types       TEXT[]      NOT NULL DEFAULT '{}',

  -- Property types they can support
  property_types      TEXT[]      NOT NULL DEFAULT '{}',

  -- Professional background
  bio                 TEXT        NOT NULL,
  experience_years    INTEGER     NOT NULL DEFAULT 0  CHECK (experience_years >= 0),
  languages           TEXT[]      NOT NULL DEFAULT '{}',

  -- Location
  region              TEXT        NOT NULL,
  city                TEXT        NOT NULL,
  phone               TEXT        NOT NULL,

  -- Fee preference
  fee_model           TEXT        NOT NULL DEFAULT 'negotiable'
                                  CHECK (fee_model IN ('percentage', 'fixed', 'negotiable')),
  fee_value           NUMERIC(10, 2),   -- % or SAR/month; NULL if negotiable

  -- Workflow
  status              TEXT        NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at         TIMESTAMPTZ,
  reviewed_by         UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  rejection_reason    TEXT,
  admin_notes         TEXT
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS cohost_applications_user_id_idx   ON public.cohost_applications (user_id);
CREATE INDEX IF NOT EXISTS cohost_applications_status_idx    ON public.cohost_applications (status);
CREATE INDEX IF NOT EXISTS cohost_applications_submitted_idx ON public.cohost_applications (submitted_at DESC);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.cohost_applications ENABLE ROW LEVEL SECURITY;

-- 1. Applicants read their own
DROP POLICY IF EXISTS "cohost_apps_read_own" ON public.cohost_applications;
CREATE POLICY "cohost_apps_read_own"
  ON public.cohost_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Applicants insert their own
DROP POLICY IF EXISTS "cohost_apps_insert_own" ON public.cohost_applications;
CREATE POLICY "cohost_apps_insert_own"
  ON public.cohost_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. Admins read all
DROP POLICY IF EXISTS "cohost_apps_admin_read_all" ON public.cohost_applications;
CREATE POLICY "cohost_apps_admin_read_all"
  ON public.cohost_applications
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 4. Admins update any
DROP POLICY IF EXISTS "cohost_apps_admin_update_all" ON public.cohost_applications;
CREATE POLICY "cohost_apps_admin_update_all"
  ON public.cohost_applications
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
