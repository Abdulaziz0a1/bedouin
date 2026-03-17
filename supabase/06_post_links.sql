-- ─────────────────────────────────────────────────────────────────────────────
-- 06_post_links.sql
-- Cross-table foreign key constraints that require both tables to exist first.
-- Execute this file LAST, after files 00–05 have all been applied.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  BEGIN
    ALTER TABLE public.listing_submissions
      ADD CONSTRAINT listing_submissions_listing_id_fkey
      FOREIGN KEY (listing_id)
      REFERENCES public.listings(id)
      ON DELETE SET NULL;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL;
  END;
END $$;