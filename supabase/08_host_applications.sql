-- ─────────────────────────────────────────────────────────────────────────────
-- 08_host_applications.sql
-- Host onboarding applications — submitted by users who want to become hosts.
-- Admins review, approve, or reject each application.
-- On approval: profiles.host_status = 'approved' and profiles.active_mode = 'host'
-- Depends on: 00_helpers.sql, 01_profiles.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Step 1: Extend profiles with host application status ─────────────────────
-- host_status:
--   NULL      → user has not applied to become a host
--   'pending' → application submitted, awaiting admin review
--   'approved'→ approved; user may freely switch between tourist and host modes
--   'rejected'→ rejected; user can re-apply (which resets back to 'pending')

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS host_status
    TEXT CHECK (host_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS host_rejection_reason TEXT;

CREATE INDEX IF NOT EXISTS profiles_host_status_idx ON public.profiles (host_status);

-- ── Step 2: Host applications table ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.host_applications (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Personal / professional details
  bio                 TEXT        NOT NULL,
  languages           TEXT[]      NOT NULL DEFAULT '{}',
  experience_years    INTEGER     NOT NULL DEFAULT 0  CHECK (experience_years >= 0),

  -- Property preferences
  property_types      TEXT[]      NOT NULL DEFAULT '{}',
  region              TEXT        NOT NULL,
  city                TEXT        NOT NULL,

  -- Contact (stored here separately from profiles so application is self-contained)
  phone               TEXT        NOT NULL,

  -- Payout / bank info (JSONB so we don't hard-code banking fields)
  -- Typical keys: bank_name, iban, account_holder
  payment_info        JSONB       NOT NULL DEFAULT '{}',

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

CREATE INDEX IF NOT EXISTS host_applications_user_id_idx    ON public.host_applications (user_id);
CREATE INDEX IF NOT EXISTS host_applications_status_idx     ON public.host_applications (status);
CREATE INDEX IF NOT EXISTS host_applications_submitted_idx  ON public.host_applications (submitted_at DESC);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.host_applications ENABLE ROW LEVEL SECURITY;

-- 1. Applicants read their own applications
DROP POLICY IF EXISTS "host_apps_read_own" ON public.host_applications;
CREATE POLICY "host_apps_read_own"
  ON public.host_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Applicants insert their own (one at a time — enforced in the server action)
DROP POLICY IF EXISTS "host_apps_insert_own" ON public.host_applications;
CREATE POLICY "host_apps_insert_own"
  ON public.host_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. Admins read all applications
DROP POLICY IF EXISTS "host_apps_admin_read_all" ON public.host_applications;
CREATE POLICY "host_apps_admin_read_all"
  ON public.host_applications
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 4. Admins update any application (approve / reject)
DROP POLICY IF EXISTS "host_apps_admin_update_all" ON public.host_applications;
CREATE POLICY "host_apps_admin_update_all"
  ON public.host_applications
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
