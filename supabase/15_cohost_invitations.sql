-- ─────────────────────────────────────────────────────────────────────────────
-- 15_cohost_invitations.sql
-- Tables for the co-host invitation and assignment workflow.
--
-- Flow:
--   Host sends invite → cohost_invitations (status: pending)
--   Co-host accepts   → status = 'accepted' + cohost_assignments row created
--   Co-host declines  → status = 'declined'
--   Host cancels      → status = 'cancelled'
--
-- Depends on: 09_cohost_applications.sql (cohost_applications table)
-- Safe to re-run: uses IF NOT EXISTS + DROP POLICY IF EXISTS
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. cohost_invitations ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.cohost_invitations (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parties
  host_id               UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cohost_user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cohost_application_id UUID        NOT NULL REFERENCES public.cohost_applications(id) ON DELETE CASCADE,

  -- Listing (denormalised for display without joins)
  listing_id            UUID        NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  listing_title         TEXT        NOT NULL DEFAULT '',
  listing_image         TEXT        NOT NULL DEFAULT '',

  -- Content
  message               TEXT        NOT NULL DEFAULT '',
  status                TEXT        NOT NULL DEFAULT 'pending'
                                    CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),

  -- Timestamps
  sent_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at          TIMESTAMPTZ,

  -- Prevent duplicate active invites for the same host + cohost + listing
  UNIQUE (host_id, cohost_application_id, listing_id)
);

CREATE INDEX IF NOT EXISTS cohost_inv_host_idx      ON public.cohost_invitations (host_id);
CREATE INDEX IF NOT EXISTS cohost_inv_cohost_idx    ON public.cohost_invitations (cohost_user_id);
CREATE INDEX IF NOT EXISTS cohost_inv_status_idx    ON public.cohost_invitations (status);
CREATE INDEX IF NOT EXISTS cohost_inv_sent_idx      ON public.cohost_invitations (sent_at DESC);

ALTER TABLE public.cohost_invitations ENABLE ROW LEVEL SECURITY;

-- Host: read their own sent invitations
DROP POLICY IF EXISTS "cohostinv_host_select" ON public.cohost_invitations;
CREATE POLICY "cohostinv_host_select"
  ON public.cohost_invitations FOR SELECT
  TO authenticated
  USING (host_id = auth.uid());

-- Host: send invitations
DROP POLICY IF EXISTS "cohostinv_host_insert" ON public.cohost_invitations;
CREATE POLICY "cohostinv_host_insert"
  ON public.cohost_invitations FOR INSERT
  TO authenticated
  WITH CHECK (host_id = auth.uid());

-- Host: cancel their pending invitation
DROP POLICY IF EXISTS "cohostinv_host_update" ON public.cohost_invitations;
CREATE POLICY "cohostinv_host_update"
  ON public.cohost_invitations FOR UPDATE
  TO authenticated
  USING (host_id = auth.uid())
  WITH CHECK (host_id = auth.uid());

-- Co-host: read invitations sent to them
DROP POLICY IF EXISTS "cohostinv_cohost_select" ON public.cohost_invitations;
CREATE POLICY "cohostinv_cohost_select"
  ON public.cohost_invitations FOR SELECT
  TO authenticated
  USING (cohost_user_id = auth.uid());

-- Co-host: respond (accept / decline) to their own invitation
DROP POLICY IF EXISTS "cohostinv_cohost_update" ON public.cohost_invitations;
CREATE POLICY "cohostinv_cohost_update"
  ON public.cohost_invitations FOR UPDATE
  TO authenticated
  USING (cohost_user_id = auth.uid())
  WITH CHECK (cohost_user_id = auth.uid());

-- ── 2. cohost_assignments ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.cohost_assignments (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link back to the invitation that created this assignment
  invitation_id         UUID        NOT NULL UNIQUE
                                    REFERENCES public.cohost_invitations(id) ON DELETE CASCADE,

  -- Parties
  host_id               UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cohost_user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cohost_application_id UUID        NOT NULL REFERENCES public.cohost_applications(id) ON DELETE CASCADE,

  -- Listing (denormalised for display)
  listing_id            UUID        NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  listing_title         TEXT        NOT NULL DEFAULT '',
  listing_image         TEXT        NOT NULL DEFAULT '',

  assigned_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cohost_assign_host_idx   ON public.cohost_assignments (host_id);
CREATE INDEX IF NOT EXISTS cohost_assign_cohost_idx ON public.cohost_assignments (cohost_user_id);

ALTER TABLE public.cohost_assignments ENABLE ROW LEVEL SECURITY;

-- Host: read assignments on their listings
DROP POLICY IF EXISTS "cohostassign_host_select" ON public.cohost_assignments;
CREATE POLICY "cohostassign_host_select"
  ON public.cohost_assignments FOR SELECT
  TO authenticated
  USING (host_id = auth.uid());

-- Co-host: read their own assignments
DROP POLICY IF EXISTS "cohostassign_cohost_select" ON public.cohost_assignments;
CREATE POLICY "cohostassign_cohost_select"
  ON public.cohost_assignments FOR SELECT
  TO authenticated
  USING (cohost_user_id = auth.uid());

-- Co-host: create their own assignment (on accepting an invitation)
DROP POLICY IF EXISTS "cohostassign_insert" ON public.cohost_assignments;
CREATE POLICY "cohostassign_insert"
  ON public.cohost_assignments FOR INSERT
  TO authenticated
  WITH CHECK (cohost_user_id = auth.uid());

-- Host: remove a co-host from their listing
DROP POLICY IF EXISTS "cohostassign_host_delete" ON public.cohost_assignments;
CREATE POLICY "cohostassign_host_delete"
  ON public.cohost_assignments FOR DELETE
  TO authenticated
  USING (host_id = auth.uid());

-- Co-host: remove themselves from a listing
DROP POLICY IF EXISTS "cohostassign_cohost_delete" ON public.cohost_assignments;
CREATE POLICY "cohostassign_cohost_delete"
  ON public.cohost_assignments FOR DELETE
  TO authenticated
  USING (cohost_user_id = auth.uid());
