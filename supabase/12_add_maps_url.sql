-- ─────────────────────────────────────────────────────────────────────────────
-- 12_add_maps_url.sql
-- Adds a Google Maps / GPS location link column to listing submissions and
-- live listings tables.  Safe to run multiple times (IF NOT EXISTS).
-- Depends on: 02_listing_submissions.sql, 03_listings.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- listing_submissions: store the link the host pastes during the create flow
ALTER TABLE public.listing_submissions
  ADD COLUMN IF NOT EXISTS maps_url TEXT;

-- listings: copied from the submission when admin approves
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS maps_url TEXT;
