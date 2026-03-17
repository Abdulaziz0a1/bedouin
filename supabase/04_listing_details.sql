-- ─────────────────────────────────────────────────────────────────────────────
-- 04_listing_details.sql
-- Rich per-listing detail content — 1-to-1 with listings.
-- JSONB columns store complex nested objects (host card, amenities, reviews).
-- Depends on: 00_helpers.sql, 03_listings.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.listing_details (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id       UUID        NOT NULL UNIQUE REFERENCES public.listings(id) ON DELETE CASCADE,

  -- Gallery (array of image URLs; first element mirrors listings.image)
  images           TEXT[]      NOT NULL DEFAULT '{}',

  -- Long-form text content
  description      TEXT        NOT NULL DEFAULT '',
  highlights       TEXT[]      NOT NULL DEFAULT '{}',
  house_rules      TEXT[]      NOT NULL DEFAULT '{}',

  -- Capacity & logistics (mirrors listings columns; kept here for the detail JOIN)
  max_guests       INTEGER     NOT NULL DEFAULT 1,
  bedrooms         INTEGER     NOT NULL DEFAULT 0,
  beds             INTEGER     NOT NULL DEFAULT 1,
  baths            INTEGER     NOT NULL DEFAULT 1,
  min_nights       INTEGER     NOT NULL DEFAULT 1,
  check_in_time    TEXT        NOT NULL DEFAULT '3:00 PM',
  check_out_time   TEXT        NOT NULL DEFAULT '11:00 AM',

  -- JSONB: host card
  -- Expected shape:
  --   { name: string, avatar: string, tagline: string, since: string,
  --     responseRate: number, superhost: boolean }
  host             JSONB,

  -- JSONB: amenities list
  -- Expected shape: [{ icon: string, label: string }, ...]
  amenities        JSONB       NOT NULL DEFAULT '[]',

  -- JSONB: guest reviews
  -- Expected shape:
  --   [{ id: string, author: string, avatar: string, rating: number,
  --      date: string, body: string }, ...]
  reviews          JSONB       NOT NULL DEFAULT '[]',

  -- JSONB: rating breakdown
  -- Expected shape:
  --   { cleanliness: number, accuracy: number, location: number,
  --     value: number, overall: number }
  rating_breakdown JSONB,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS listing_details_listing_id_idx ON public.listing_details (listing_id);

-- ── Auto-update updated_at ────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS set_listing_details_updated_at ON public.listing_details;
CREATE TRIGGER set_listing_details_updated_at
  BEFORE UPDATE ON public.listing_details
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();   -- defined in 01_profiles.sql

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.listing_details ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can read listing details (listing detail page is public)
CREATE POLICY "listing_details_public_read"
  ON public.listing_details
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 2. Only admins can insert detail rows (created alongside the listing on approval)
CREATE POLICY "listing_details_admin_insert"
  ON public.listing_details
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- 3. Only admins can update detail rows
CREATE POLICY "listing_details_admin_update"
  ON public.listing_details
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Only admins can delete detail rows (cascades automatically from listings)
CREATE POLICY "listing_details_admin_delete"
  ON public.listing_details
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- EXAMPLE ROW (reference only — do not execute as-is in production)
-- Shows the expected JSONB structure for a seeded listing.
-- ─────────────────────────────────────────────────────────────────────────────
--
-- INSERT INTO public.listing_details (listing_id, images, description, highlights, house_rules,
--   max_guests, bedrooms, beds, baths, min_nights, check_in_time, check_out_time,
--   host, amenities, reviews, rating_breakdown)
-- VALUES (
--   '<listing-uuid>',
--   ARRAY['https://...image1.jpg', 'https://...image2.jpg'],
--   'A stunning desert camp nestled among ancient rock formations...',
--   ARRAY['Private stargazing deck', 'Daily breakfast included', 'Desert safari on request'],
--   ARRAY['No parties or events', 'No smoking indoors', 'Pets not allowed'],
--   6, 3, 4, 2, 2, '3:00 PM', '11:00 AM',
--   '{"name":"Ahmed Al-Rashidi","avatar":"https://i.pravatar.cc/80?u=host1","tagline":"Desert hospitality expert","since":"2021","responseRate":98,"superhost":true}',
--   '[{"icon":"wifi","label":"WiFi"},{"icon":"parking","label":"Free Parking"}]',
--   '[{"id":"r1","author":"Sarah M.","avatar":"https://i.pravatar.cc/40?u=sarah","rating":9,"date":"2025-11-15","body":"Incredible experience!"}]',
--   '{"cleanliness":9.2,"accuracy":8.8,"location":9.5,"value":8.9,"overall":9.1}'
-- );
