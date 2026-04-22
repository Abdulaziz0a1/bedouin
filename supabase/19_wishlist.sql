-- ─────────────────────────────────────────────────────────────────────────────
-- 19_wishlist.sql
--
-- Creates the wishlists table so users can save listings.
-- listing_id stores the listing SLUG (matches listings.slug, used in URLs).
-- The FK to listings(slug) ensures cascading deletes and enables Supabase joins.
--
-- RLS: each user can only read/write their own rows.
-- Safe to re-run: uses IF NOT EXISTS / IF EXISTS patterns throughout.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Ensure listings.slug has a unique constraint (required for FK target) ────
-- ADD CONSTRAINT IF NOT EXISTS is not valid PostgreSQL syntax — use a DO block.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'listings_slug_unique'
      AND table_schema    = 'public'
      AND table_name      = 'listings'
  ) THEN
    ALTER TABLE public.listings ADD CONSTRAINT listings_slug_unique UNIQUE (slug);
  END IF;
END;
$$;

-- ── Create table ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.wishlists (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id  text        NOT NULL REFERENCES public.listings(slug) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, listing_id)
);

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_wishlist" ON public.wishlists;

CREATE POLICY "users_manage_own_wishlist"
  ON public.wishlists
  FOR ALL
  TO authenticated
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Verification ─────────────────────────────────────────────────────────────
-- Run after applying to confirm table and policy exist:
--
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' AND table_name = 'wishlists';
--
-- SELECT policyname FROM pg_policies
--   WHERE tablename = 'wishlists';
