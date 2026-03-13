-- public.listing_submissions table
-- Run this script once in the Supabase SQL editor.
-- Idempotent: safe to re-run.

-- 1) Create table
CREATE TABLE IF NOT EXISTS public.listing_submissions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  host_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Basic listing data captured at submission time
  title               TEXT NOT NULL,
  description         TEXT,
  category            TEXT NOT NULL,
  region              TEXT,
  city                TEXT,
  location_note       TEXT,

  price_per_night     NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_guests          INTEGER NOT NULL DEFAULT 1,
  bedrooms            INTEGER NOT NULL DEFAULT 0,
  beds                INTEGER NOT NULL DEFAULT 0,
  bathrooms           INTEGER NOT NULL DEFAULT 0,

  amenities           JSONB NOT NULL DEFAULT '[]'::jsonb,
  images              JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Moderation lifecycle
  status              TEXT NOT NULL DEFAULT 'pending_review'
                      CHECK (status IN ('pending_review', 'approved', 'rejected')),

  rejection_reason    TEXT,
  reviewed_at         TIMESTAMPTZ,
  reviewed_by         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Cross-link to live listing after approval
  listing_id          UUID,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2) Add listing_id FK if listings table already exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'listings'
  ) THEN
    BEGIN
      ALTER TABLE public.listing_submissions
      ADD CONSTRAINT listing_submissions_listing_id_fkey
      FOREIGN KEY (listing_id)
      REFERENCES public.listings(id)
      ON DELETE SET NULL;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- 3) Enable RLS
ALTER TABLE public.listing_submissions ENABLE ROW LEVEL SECURITY;

-- 4) updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_listing_submissions_updated_at ON public.listing_submissions;
CREATE TRIGGER set_listing_submissions_updated_at
BEFORE UPDATE ON public.listing_submissions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 5) Policies

-- Hosts can read only their own submissions
DROP POLICY IF EXISTS "hosts_read_own_submissions" ON public.listing_submissions;
CREATE POLICY "hosts_read_own_submissions"
ON public.listing_submissions
FOR SELECT
USING (auth.uid() = host_id);

-- Hosts can insert only their own submissions
DROP POLICY IF EXISTS "hosts_insert_own_submissions" ON public.listing_submissions;
CREATE POLICY "hosts_insert_own_submissions"
ON public.listing_submissions
FOR INSERT
WITH CHECK (auth.uid() = host_id);

-- Hosts can update only their own submissions while still pending/rejected
-- This allows resubmission/editing, but prevents them from editing already approved rows.
DROP POLICY IF EXISTS "hosts_update_editable_own_submissions" ON public.listing_submissions;
CREATE POLICY "hosts_update_editable_own_submissions"
ON public.listing_submissions
FOR UPDATE
USING (
  auth.uid() = host_id
  AND status IN ('pending_review', 'rejected')
)
WITH CHECK (
  auth.uid() = host_id
  AND status IN ('pending_review', 'rejected')
);

-- Admins can read all submissions
DROP POLICY IF EXISTS "admins_read_all_submissions" ON public.listing_submissions;
CREATE POLICY "admins_read_all_submissions"
ON public.listing_submissions
FOR SELECT
USING (public.is_admin());

-- Admins can update all submissions
DROP POLICY IF EXISTS "admins_update_all_submissions" ON public.listing_submissions;
CREATE POLICY "admins_update_all_submissions"
ON public.listing_submissions
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Optional: admins can delete submissions if ever needed later
DROP POLICY IF EXISTS "admins_delete_all_submissions" ON public.listing_submissions;
CREATE POLICY "admins_delete_all_submissions"
ON public.listing_submissions
FOR DELETE
USING (public.is_admin());

-- 6) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_listing_submissions_host_id
  ON public.listing_submissions(host_id);

CREATE INDEX IF NOT EXISTS idx_listing_submissions_status
  ON public.listing_submissions(status);

CREATE INDEX IF NOT EXISTS idx_listing_submissions_created_at
  ON public.listing_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listing_submissions_host_status
  ON public.listing_submissions(host_id, status);

CREATE INDEX IF NOT EXISTS idx_listing_submissions_reviewed_by
  ON public.listing_submissions(reviewed_by);

CREATE INDEX IF NOT EXISTS idx_listing_submissions_listing_id
  ON public.listing_submissions(listing_id);