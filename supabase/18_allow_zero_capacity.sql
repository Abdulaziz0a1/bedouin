-- ─────────────────────────────────────────────────────────────────────────────
-- 18_allow_zero_capacity.sql
--
-- WHY: The platform supports both accommodation and experience listings.
-- Experiences (tours, camel rides, stargazing, etc.) legitimately have 0 beds
-- and 0 baths. The existing CHECK constraints (beds >= 1, baths >= 1) block
-- valid submissions and cause silent insert failures for these listing types.
--
-- FIX: Relax the bed/bath minimums from 1 → 0 in both tables.
-- bedrooms already allows 0 — no change needed there.
-- max_guests minimum stays at 1 (every listing needs at least 1 guest).
--
-- Safe to re-run: uses IF EXISTS / IF NOT EXISTS patterns where possible.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── listing_submissions ───────────────────────────────────────────────────────

ALTER TABLE public.listing_submissions
  DROP CONSTRAINT IF EXISTS listing_submissions_beds_check,
  DROP CONSTRAINT IF EXISTS listing_submissions_baths_check;

ALTER TABLE public.listing_submissions
  ADD CONSTRAINT listing_submissions_beds_check  CHECK (beds  >= 0),
  ADD CONSTRAINT listing_submissions_baths_check CHECK (baths >= 0);

ALTER TABLE public.listing_submissions
  ALTER COLUMN beds  SET DEFAULT 0,
  ALTER COLUMN baths SET DEFAULT 0;

-- ── listings (live, admin-promoted) ──────────────────────────────────────────

ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS listings_beds_check,
  DROP CONSTRAINT IF EXISTS listings_baths_check;

ALTER TABLE public.listings
  ADD CONSTRAINT listings_beds_check  CHECK (beds  >= 0),
  ADD CONSTRAINT listings_baths_check CHECK (baths >= 0);

ALTER TABLE public.listings
  ALTER COLUMN beds  SET DEFAULT 0,
  ALTER COLUMN baths SET DEFAULT 0;

-- ── Verification ─────────────────────────────────────────────────────────────
-- Run in SQL Editor after applying to confirm constraints updated:
--
-- SELECT conname, consrc
-- FROM pg_constraint
-- WHERE conrelid IN (
--   'public.listing_submissions'::regclass,
--   'public.listings'::regclass
-- )
-- AND conname LIKE '%beds%' OR conname LIKE '%baths%';
--
-- Expected: beds >= 0, baths >= 0 for both tables.
