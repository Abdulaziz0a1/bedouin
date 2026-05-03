-- ─────────────────────────────────────────────────────────────────────────────
-- 12_submitted_at_nullable.sql
-- Drops the NOT NULL constraint from listing_submissions.submitted_at so that
-- template drafts (created via duplicateListing / "Use as template") can exist
-- with submitted_at = NULL until the host explicitly clicks "Submit for review".
--
-- Business rules after this migration:
--   status = 'draft'          → submitted_at IS NULL  (not yet submitted)
--   status = 'pending_review' → submitted_at IS NOT NULL  (set by updateListing)
--   status = 'approved' / 'rejected' / 'cancelled' → submitted_at IS NOT NULL
--
-- Safe to run on a live database:
--   • ALTER COLUMN … DROP NOT NULL is a metadata-only change; no table rewrite.
--   • Existing rows are not touched; their submitted_at values are preserved.
--
-- Depends on: 02_listing_submissions.sql
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.listing_submissions
  ALTER COLUMN submitted_at DROP NOT NULL;

COMMENT ON COLUMN public.listing_submissions.submitted_at IS
  'Set to NOW() when the host submits for review (pending_review/approved/rejected). '
  'NULL for draft rows that have not been submitted yet (e.g. template copies created '
  'by duplicateListing() before the host completes the edit flow).';
