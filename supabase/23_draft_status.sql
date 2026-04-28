-- ─────────────────────────────────────────────────────────────────────────────
-- 23_draft_status.sql
-- Adds 'draft' as a valid status for listing_submissions so that template
-- copies created by duplicateListing() ("Use as template") can exist in the
-- DB without being sent to the admin review queue.
--
-- Two objects are updated:
--
--   1. listing_submissions_status_check — the CHECK constraint that guards the
--      status column.  Previous value (from 21_cancellations.sql):
--        ('pending_review', 'approved', 'rejected', 'cancelled')
--      New value:
--        ('draft', 'pending_review', 'approved', 'rejected', 'cancelled')
--
--   2. submissions_update_own — the RLS policy that lets hosts edit their own
--      submissions.  The USING clause previously only allowed rows whose
--      status was already 'pending_review' or 'rejected', which blocked the
--      host from updating a 'draft' row (e.g. submitting a template draft for
--      review via updateListing()).
--      Fix: add 'draft' to the USING clause only.
--      The WITH CHECK clause stays as ('pending_review', 'rejected') because
--      updateListing() always promotes the row to 'pending_review' — hosts
--      must never be allowed to write back a 'draft' status value.
--
-- Safe to run on a live database:
--   • DROP CONSTRAINT / ADD CONSTRAINT and DROP POLICY / CREATE POLICY are
--     DDL-only; no rows are modified.
--   • Existing rows keep their current status values.
--
-- Depends on: 02_listing_submissions.sql, 14_host_can_update_own_submissions.sql,
--             21_cancellations.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Status CHECK constraint ────────────────────────────────────────────────

ALTER TABLE public.listing_submissions
  DROP CONSTRAINT IF EXISTS listing_submissions_status_check;

ALTER TABLE public.listing_submissions
  ADD CONSTRAINT listing_submissions_status_check
    CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'cancelled'));

-- ── 2. Host-update RLS policy ─────────────────────────────────────────────────

DROP POLICY IF EXISTS "submissions_update_own" ON public.listing_submissions;

CREATE POLICY "submissions_update_own"
  ON public.listing_submissions
  FOR UPDATE
  TO authenticated
  -- Hosts may update rows that are in an editable state (draft, pending, or rejected).
  -- 'approved' and 'cancelled' are intentionally excluded — those are admin-owned states.
  USING  (auth.uid() = host_id AND status IN ('draft', 'pending_review', 'rejected'))
  -- After the update the row must be pending_review or rejected.
  -- This prevents a host from locking a row back into 'draft' via a direct API call.
  WITH CHECK (auth.uid() = host_id AND status IN ('pending_review', 'rejected'));
