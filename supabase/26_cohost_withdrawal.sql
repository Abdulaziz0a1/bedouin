-- ─────────────────────────────────────────────────────────────────────────────
-- 26_cohost_withdrawal.sql
-- Adds a status lifecycle to cohost_assignments so a co-host can request
-- to stop the assignment and the host can approve or reject.
--
-- New status values:
--   active               — default; assignment is ongoing (all existing rows)
--   withdrawal_requested — co-host has asked to stop; awaiting host decision
--   ended                — host approved withdrawal; excluded from active views
--
-- Two additive UPDATE policies are required (none existed before).
-- Existing SELECT / INSERT / DELETE policies are untouched.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.cohost_assignments
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'withdrawal_requested', 'ended'));

-- Co-host may request withdrawal (active → withdrawal_requested)
CREATE POLICY "cohostassign_cohost_update"
  ON public.cohost_assignments FOR UPDATE
  TO authenticated
  USING  (cohost_user_id = auth.uid())
  WITH CHECK (cohost_user_id = auth.uid());

-- Host may resolve a withdrawal request (withdrawal_requested → active | ended)
CREATE POLICY "cohostassign_host_update"
  ON public.cohost_assignments FOR UPDATE
  TO authenticated
  USING  (host_id = auth.uid())
  WITH CHECK (host_id = auth.uid());
