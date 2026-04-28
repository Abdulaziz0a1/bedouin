-- ─────────────────────────────────────────────────────────────────────────────
-- 24_submission_soft_delete.sql
-- Enables hosts to remove their own draft / rejected / pending submissions
-- without deleting data irreversibly.
--
-- Changes:
--
--   1. listing_submissions.removed_at TIMESTAMPTZ (nullable)
--      Set by removeSubmission() when the host soft-deletes a submission.
--      NULL on every normal (non-removed) row.
--      All host-dashboard and admin queries filter WHERE removed_at IS NULL.
--
--   2. submissions_update_own RLS policy — WITH CHECK extended to include
--      'draft'.  Previously 'draft' was excluded, which blocked hosts from
--      soft-deleting a draft row (status stays 'draft', only removed_at
--      changes; the old WITH CHECK rejected the resulting row).
--      The updated policy prevents hosts from promoting status to 'approved'
--      or 'cancelled' — those remain admin-only states.
--
-- Business rules:
--   • status = 'approved'  → cannot be removed here; use Request cancellation.
--   • status = 'cancelled' → already inactive; host has no edit rights.
--   • status IN ('draft', 'pending_review', 'rejected') → host may soft-delete.
--   • removed_at IS NOT NULL → excluded from all host and admin queries.
--
-- Safe to run on a live database:
--   • ADD COLUMN IF NOT EXISTS never rewrites the table.
--   • Existing rows keep removed_at = NULL (treated as not removed).
--   • DROP POLICY / CREATE POLICY is DDL-only.
--
-- Depends on: 02_listing_submissions.sql, 23_draft_status.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Add removed_at column ──────────────────────────────────────────────────

ALTER TABLE public.listing_submissions
  ADD COLUMN IF NOT EXISTS removed_at TIMESTAMPTZ;

COMMENT ON COLUMN public.listing_submissions.removed_at IS
  'Soft-delete timestamp set by removeSubmission() when the host removes a draft, '
  'rejected, or pending_review submission.  NULL on all active rows.  Excluded from '
  'host-dashboard and admin-panel queries.';

CREATE INDEX IF NOT EXISTS listing_submissions_removed_at_idx
  ON public.listing_submissions (removed_at)
  WHERE removed_at IS NOT NULL;

-- ── 2. Update host-update RLS policy WITH CHECK to include draft ──────────────

DROP POLICY IF EXISTS "submissions_update_own" ON public.listing_submissions;

CREATE POLICY "submissions_update_own"
  ON public.listing_submissions
  FOR UPDATE
  TO authenticated
  -- Allow updates on any editable row the host owns.
  USING  (auth.uid() = host_id AND status IN ('draft', 'pending_review', 'rejected'))
  -- After the update the row must remain in a non-admin-controlled state.
  -- Hosts can never promote status to 'approved' or 'cancelled'.
  WITH CHECK (auth.uid() = host_id AND status IN ('draft', 'pending_review', 'rejected'));
