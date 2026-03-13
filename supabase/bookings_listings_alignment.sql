-- bookings + listings alignment
-- Safe to re-run

-- 1) Add new columns to bookings
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS listing_category TEXT;

ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS host_id UUID;

ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS host_name TEXT;

-- 2) Add FK from bookings.host_id -> profiles.id
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.bookings
    ADD CONSTRAINT bookings_host_id_fkey
    FOREIGN KEY (host_id)
    REFERENCES public.profiles(id)
    ON DELETE SET NULL;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

-- 3) Add new column to listings
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS submission_id UUID;

-- 4) Add FK from listings.submission_id -> listing_submissions.id
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.listings
    ADD CONSTRAINT listings_submission_id_fkey
    FOREIGN KEY (submission_id)
    REFERENCES public.listing_submissions(id)
    ON DELETE SET NULL;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

-- 5) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id
  ON public.bookings(user_id);

CREATE INDEX IF NOT EXISTS idx_bookings_host_id
  ON public.bookings(host_id);

CREATE INDEX IF NOT EXISTS idx_bookings_listing_id
  ON public.bookings(listing_id);

CREATE INDEX IF NOT EXISTS idx_bookings_status
  ON public.bookings(status);

CREATE INDEX IF NOT EXISTS idx_listings_submission_id
  ON public.listings(submission_id);