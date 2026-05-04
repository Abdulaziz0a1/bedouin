-- ─────────────────────────────────────────────────────────────────────────────
-- 33_cohost_app_update_rls.sql
-- Allows co-host applicants to update their own application row for
-- resubmission after approval or rejection.
--
-- Security invariant: WITH CHECK restricts the resulting status to 'pending'
-- so a user can never self-approve. Admin approval still goes through the
-- existing cohost_apps_admin_update_all policy (which is independent).
-- Safe to re-run: DROP POLICY IF EXISTS.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "cohost_apps_update_own" ON public.cohost_applications;
CREATE POLICY "cohost_apps_update_own"
  ON public.cohost_applications FOR UPDATE
  TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status = 'pending');
