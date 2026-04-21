-- ─────────────────────────────────────────────────────────────────────────────
-- 17_cohost_marketplace_rls.sql
--
-- ROOT CAUSE FIX: The existing RLS on cohost_applications only allows a user
-- to SELECT their own row (auth.uid() = user_id). This means hosts browsing
-- /cohost see zero results because they have no row of their own.
--
-- Fix: add a policy that allows any authenticated user to read APPROVED
-- applications. Approved co-hosts are explicitly meant to be visible to hosts
-- in the marketplace — this is the intended public-facing data.
--
-- Pending/rejected applications remain private (only visible to the applicant
-- and admins via the existing policies).
--
-- Safe to re-run: DROP POLICY IF EXISTS before CREATE.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "cohost_apps_read_approved_marketplace" ON public.cohost_applications;

CREATE POLICY "cohost_apps_read_approved_marketplace"
  ON public.cohost_applications
  FOR SELECT
  TO authenticated
  USING (status = 'approved');

-- ── Verification hint (run in SQL Editor after applying) ───────────────────
-- SELECT id, user_id, status FROM cohost_applications WHERE status = 'approved';
-- (should return rows when executed as a non-admin authenticated user)
