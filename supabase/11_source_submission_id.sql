-- ─────────────────────────────────────────────────────────────────────────────
-- 11_source_submission_id.sql
-- Adds source_submission_id to listing_submissions so the system can
-- identify template-based (duplicated) listings and run a multi-field
-- similarity check before allowing resubmission.
--
-- Depends on: 02_listing_submissions.sql
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.listing_submissions
  ADD COLUMN IF NOT EXISTS source_submission_id UUID
    REFERENCES public.listing_submissions(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.listing_submissions.source_submission_id IS
  'Set by duplicateListing() to point at the source listing this draft was '
  'copied from. Used in updateListing() to run a meaningful-difference check '
  'so hosts cannot submit an effectively-identical copy.';

CREATE INDEX IF NOT EXISTS listing_submissions_source_id_idx
  ON public.listing_submissions (source_submission_id)
  WHERE source_submission_id IS NOT NULL;
