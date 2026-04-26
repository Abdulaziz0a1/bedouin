-- ─────────────────────────────────────────────────────────────────────────────
-- 21_cancellations.sql
-- Cancellation workflow: booking cancellation metadata + listing cancellation
-- requests (host → admin review).
-- Depends on: 00_helpers.sql, 01_profiles.sql, 02_listing_submissions.sql,
--             05_bookings.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Extend bookings with cancellation metadata ─────────────────────────────
--
-- Status remains 'confirmed' | 'cancelled' — the DB status is intentionally
-- coarse. cancellation_type carries the actor detail ('by_tourist') so the
-- host can see who cancelled without changing the existing constraint or the
-- deriveStatus() logic in TypeScript.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS cancellation_type   TEXT,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── 2. Add 'cancelled' status to listing_submissions ─────────────────────────
--
-- When an admin approves a host's cancellation request the submission is
-- marked 'cancelled' (distinct from 'rejected') and the live listing is
-- removed.  We must drop the existing status CHECK before adding the new value.

ALTER TABLE public.listing_submissions
  DROP CONSTRAINT IF EXISTS listing_submissions_status_check;

ALTER TABLE public.listing_submissions
  ADD CONSTRAINT listing_submissions_status_check
    CHECK (status IN ('pending_review', 'approved', 'rejected', 'cancelled'));

-- ── 3. listing_cancellation_requests ─────────────────────────────────────────
--
-- A host submits one of these to ask admin to deactivate their listing.
-- Only one pending request per submission is expected; the host is blocked
-- from submitting a second while the first is pending (enforced in the action).

CREATE TABLE IF NOT EXISTS public.listing_cancellation_requests (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_submission_id UUID        NOT NULL
                                    REFERENCES public.listing_submissions(id)
                                    ON DELETE CASCADE,
  host_id               UUID        NOT NULL
                                    REFERENCES auth.users(id)
                                    ON DELETE CASCADE,
  reason                TEXT        NOT NULL,
  status                TEXT        NOT NULL DEFAULT 'pending'
                                    CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note            TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at           TIMESTAMPTZ,
  reviewed_by           UUID        REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS lcr_host_id_idx
  ON public.listing_cancellation_requests (host_id);

CREATE INDEX IF NOT EXISTS lcr_submission_id_idx
  ON public.listing_cancellation_requests (listing_submission_id);

CREATE INDEX IF NOT EXISTS lcr_status_idx
  ON public.listing_cancellation_requests (status);

-- ── 4. RLS for listing_cancellation_requests ──────────────────────────────────

ALTER TABLE public.listing_cancellation_requests ENABLE ROW LEVEL SECURITY;

-- Hosts read their own requests
CREATE POLICY "lcr_host_read_own"
  ON public.listing_cancellation_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = host_id);

-- Hosts insert for their own listings (action also verifies submission ownership)
CREATE POLICY "lcr_host_insert"
  ON public.listing_cancellation_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = host_id);

-- Admins read all
CREATE POLICY "lcr_admin_read"
  ON public.listing_cancellation_requests
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Admins update (approve / reject)
CREATE POLICY "lcr_admin_update"
  ON public.listing_cancellation_requests
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
