-- public.listings table
-- Safe to re-run

CREATE TABLE IF NOT EXISTS public.listings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  host_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  submission_id     UUID UNIQUE REFERENCES public.listing_submissions(id) ON DELETE SET NULL,

  title             TEXT NOT NULL,
  description       TEXT,
  category          TEXT NOT NULL,
  region            TEXT,
  city              TEXT,
  location_note     TEXT,

  price_per_night   NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_guests        INTEGER NOT NULL DEFAULT 1,
  bedrooms          INTEGER NOT NULL DEFAULT 0,
  beds              INTEGER NOT NULL DEFAULT 0,
  bathrooms         INTEGER NOT NULL DEFAULT 0,

  amenities         JSONB NOT NULL DEFAULT '[]'::jsonb,
  images            JSONB NOT NULL DEFAULT '[]'::jsonb,

  status            TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'inactive')),

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_listings_updated_at ON public.listings;
CREATE TRIGGER set_listings_updated_at
BEFORE UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Public can read only active listings
DROP POLICY IF EXISTS "public_read_active_listings" ON public.listings;
CREATE POLICY "public_read_active_listings"
ON public.listings
FOR SELECT
USING (status = 'active');

-- Hosts can read their own listings
DROP POLICY IF EXISTS "hosts_read_own_listings" ON public.listings;
CREATE POLICY "hosts_read_own_listings"
ON public.listings
FOR SELECT
USING (auth.uid() = host_id);

-- Admins can read all listings
DROP POLICY IF EXISTS "admins_read_all_listings" ON public.listings;
CREATE POLICY "admins_read_all_listings"
ON public.listings
FOR SELECT
USING (public.is_admin());

-- Admins can insert listings (used by approval flow for now)
DROP POLICY IF EXISTS "admins_insert_listings" ON public.listings;
CREATE POLICY "admins_insert_listings"
ON public.listings
FOR INSERT
WITH CHECK (public.is_admin());

-- Admins can update all listings
DROP POLICY IF EXISTS "admins_update_all_listings" ON public.listings;
CREATE POLICY "admins_update_all_listings"
ON public.listings
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_listings_host_id
  ON public.listings(host_id);

CREATE INDEX IF NOT EXISTS idx_listings_submission_id
  ON public.listings(submission_id);

CREATE INDEX IF NOT EXISTS idx_listings_status
  ON public.listings(status);

CREATE INDEX IF NOT EXISTS idx_listings_category
  ON public.listings(category);

CREATE INDEX IF NOT EXISTS idx_listings_region
  ON public.listings(region);

CREATE INDEX IF NOT EXISTS idx_listings_created_at
  ON public.listings(created_at DESC);