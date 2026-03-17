-- ─────────────────────────────────────────────────────────────────────────────
-- 02_listing_submissions.sql
-- Listing submissions queue — created by hosts, reviewed by admins.
-- Depends on: 00_helpers.sql, 01_profiles.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.listing_submissions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reference        TEXT        NOT NULL UNIQUE,
  host_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Listing content (matches listing.ts insert contract exactly)
  title            TEXT        NOT NULL,
  category         TEXT        NOT NULL,
  region           TEXT        NOT NULL,
  location         TEXT,
  description      TEXT,
  highlights       TEXT[]      NOT NULL DEFAULT '{}',
  amenities        TEXT[]      NOT NULL DEFAULT '{}',
  house_rules      TEXT[]      NOT NULL DEFAULT '{}',
  image_urls       TEXT[]      NOT NULL DEFAULT '{}',

  -- Capacity & logistics
  max_guests       INTEGER     NOT NULL DEFAULT 1  CHECK (max_guests  >= 1),
  bedrooms         INTEGER     NOT NULL DEFAULT 0  CHECK (bedrooms    >= 0),
  beds             INTEGER     NOT NULL DEFAULT 1  CHECK (beds        >= 1),
  baths            INTEGER     NOT NULL DEFAULT 1  CHECK (baths       >= 1),
  min_nights       INTEGER     NOT NULL DEFAULT 1  CHECK (min_nights  >= 1),
  check_in_time    TEXT        NOT NULL DEFAULT '3:00 PM',
  check_out_time   TEXT        NOT NULL DEFAULT '11:00 AM',

  -- Pricing
  price            NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  original_price   NUMERIC(10, 2)           CHECK (original_price >= 0),
  price_unit       TEXT        NOT NULL DEFAULT 'per night',

  -- Workflow
  status           TEXT        NOT NULL DEFAULT 'pending_review'
                               CHECK (status IN ('pending_review', 'approved', 'rejected')),
  submitted_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Admin review fields (set by admin.ts approve/reject actions)
  reviewed_at      TIMESTAMPTZ,
  reviewed_by      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
                               -- Stores the admin's auth.uid() at the moment of review.
                               -- Provides stable identity linkage for audit integrity.
  rejection_reason TEXT,
  admin_notes      TEXT,

  -- Cross-link to live listings (set by approveSubmission() after INSERT into listings)
  -- FK to public.listings added in 06_post_links.sql (listings table created in 03).
  listing_id       UUID
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS listing_submissions_host_id_idx    ON public.listing_submissions (host_id);
CREATE INDEX IF NOT EXISTS listing_submissions_status_idx     ON public.listing_submissions (status);
CREATE INDEX IF NOT EXISTS listing_submissions_submitted_at_idx ON public.listing_submissions (submitted_at DESC);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.listing_submissions ENABLE ROW LEVEL SECURITY;

-- 1. Hosts read their own submissions (host dashboard Listings tab)
CREATE POLICY "submissions_read_own"
  ON public.listing_submissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = host_id);

-- 2. Hosts insert their own submissions (HostListingFlow submit action)
CREATE POLICY "submissions_insert_own"
  ON public.listing_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

-- 3. Admins read all submissions (admin panel queue)
CREATE POLICY "submissions_admin_read_all"
  ON public.listing_submissions
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 4. Admins update any submission (approve / reject actions)
CREATE POLICY "submissions_admin_update_all"
  ON public.listing_submissions
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
