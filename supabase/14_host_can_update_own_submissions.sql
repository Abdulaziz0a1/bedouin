-- ─────────────────────────────────────────────────────────────────────────────
-- 14_host_can_update_own_submissions.sql
-- Allows hosts to edit and resubmit their own listing submissions,
-- but only while the submission is in `pending_review` or `rejected` state.
-- Approved submissions are locked from host edits (requires admin to un-approve first).
--
-- Depends on: 02_listing_submissions.sql
-- Safe to run multiple times (DROP IF EXISTS before CREATE).
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "submissions_update_own" ON public.listing_submissions;

CREATE POLICY "submissions_update_own"
  ON public.listing_submissions
  FOR UPDATE
  TO authenticated
  USING  (auth.uid() = host_id AND status IN ('pending_review', 'rejected'))
  WITH CHECK (auth.uid() = host_id AND status IN ('pending_review', 'rejected'));
