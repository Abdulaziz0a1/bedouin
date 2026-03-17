-- ─────────────────────────────────────────────────────────────────────────────
-- 03_listings.sql
-- Live, publicly-visible listings. Promoted from listing_submissions by admins.
-- Depends on: 00_helpers.sql, 01_profiles.sql, 02_listing_submissions.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.listings (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT        NOT NULL UNIQUE,       -- URL-safe, e.g. "desert-camp-alula-a1b2c3"

  -- Core display fields (read by listing-detail.ts and explore page)
  title            TEXT        NOT NULL,
  category         TEXT        NOT NULL,
  region           TEXT        NOT NULL,
  location         TEXT        NOT NULL DEFAULT '',
  description      TEXT,

  -- Hero image (single TEXT URL; full gallery lives in listing_details.images)
  image            TEXT        NOT NULL DEFAULT '',

  -- Rating aggregates (updated by a future reviews service; seeded to 0 on approval)
  score            NUMERIC(4, 2) NOT NULL DEFAULT 0   CHECK (score >= 0 AND score <= 10),
  review_count     INTEGER     NOT NULL DEFAULT 0     CHECK (review_count >= 0),

  -- Pricing
  price            NUMERIC(10, 2) NOT NULL DEFAULT 0  CHECK (price >= 0),
  original_price   NUMERIC(10, 2)                     CHECK (original_price >= 0),
  price_unit       TEXT        NOT NULL DEFAULT 'per night',

  -- Capacity & logistics (copied from submission on approval; denormalized for search)
  max_guests       INTEGER     NOT NULL DEFAULT 1     CHECK (max_guests  >= 1),
  bedrooms         INTEGER     NOT NULL DEFAULT 0     CHECK (bedrooms    >= 0),
  beds             INTEGER     NOT NULL DEFAULT 1     CHECK (beds        >= 1),
  baths            INTEGER     NOT NULL DEFAULT 1     CHECK (baths       >= 1),
  min_nights       INTEGER     NOT NULL DEFAULT 1     CHECK (min_nights  >= 1),
  check_in_time    TEXT        NOT NULL DEFAULT '3:00 PM',
  check_out_time   TEXT        NOT NULL DEFAULT '11:00 AM',

  -- Discovery badges and tags (managed by admin after approval)
  badge            TEXT,                              -- e.g. "Weekend Deal", "Trending"
  badge_color      TEXT,                              -- e.g. "#049153"
  tags             TEXT[]      NOT NULL DEFAULT '{}', -- e.g. ["Desert", "Glamping"]

  -- Ownership & provenance
  host_id          UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  submission_id    UUID        REFERENCES public.listing_submissions(id) ON DELETE SET NULL,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS listings_slug_idx       ON public.listings (slug);
CREATE INDEX IF NOT EXISTS listings_category_idx   ON public.listings (category);
CREATE INDEX IF NOT EXISTS listings_region_idx     ON public.listings (region);
CREATE INDEX IF NOT EXISTS listings_host_id_idx    ON public.listings (host_id);
CREATE INDEX IF NOT EXISTS listings_score_idx      ON public.listings (score DESC);

-- ── Auto-update updated_at ────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS set_listings_updated_at ON public.listings;
CREATE TRIGGER set_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();   -- defined in 01_profiles.sql

-- Note: the FK from listing_submissions.listing_id → listings.id
-- is added in 06_post_links.sql after both tables exist.

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- 1. Anyone (including unauthenticated visitors) can read live listings
--    (explore page, listing detail page, booking flow)
CREATE POLICY "listings_public_read"
  ON public.listings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 2. Only admins can insert listings (approveSubmission() action)
CREATE POLICY "listings_admin_insert"
  ON public.listings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- 3. Only admins can update listings (future: edit after approval, update badges)
CREATE POLICY "listings_admin_update"
  ON public.listings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Only admins can delete listings
CREATE POLICY "listings_admin_delete"
  ON public.listings
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
