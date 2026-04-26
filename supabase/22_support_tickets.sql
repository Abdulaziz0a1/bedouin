-- ─────────────────────────────────────────────────────────────────────────────
-- 22_support_tickets.sql
-- Help Center support ticket workflow.
-- Depends on: 00_helpers.sql, 01_profiles.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. support_tickets ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issue_type  TEXT        NOT NULL
                          CHECK (issue_type IN (
                            'booking_issue',
                            'payment_issue',
                            'host_issue',
                            'tourist_issue',
                            'safety_concern',
                            'listing_problem',
                            'other'
                          )),
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'open'
                          CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS st_user_id_idx  ON public.support_tickets (user_id);
CREATE INDEX IF NOT EXISTS st_status_idx   ON public.support_tickets (status);
CREATE INDEX IF NOT EXISTS st_created_idx  ON public.support_tickets (created_at DESC);

-- ── 2. support_replies ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.support_replies (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID        NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message     TEXT        NOT NULL,
  is_admin    BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sr_ticket_id_idx ON public.support_replies (ticket_id);
CREATE INDEX IF NOT EXISTS sr_created_idx   ON public.support_replies (created_at ASC);

-- ── 3. Auto-update updated_at on ticket changes ───────────────────────────────

CREATE OR REPLACE FUNCTION public.touch_support_ticket_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER trg_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.touch_support_ticket_updated_at();

-- ── 4. RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_replies  ENABLE ROW LEVEL SECURITY;

-- Users: read own tickets
CREATE POLICY "st_user_read_own"
  ON public.support_tickets FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users: insert own tickets
CREATE POLICY "st_user_insert"
  ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users: update own tickets (for self-close)
CREATE POLICY "st_user_update_own"
  ON public.support_tickets FOR UPDATE TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins: read all tickets
CREATE POLICY "st_admin_read"
  ON public.support_tickets FOR SELECT TO authenticated
  USING (public.is_admin());

-- Admins: update any ticket (status changes, etc.)
CREATE POLICY "st_admin_update"
  ON public.support_tickets FOR UPDATE TO authenticated
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());

-- Users: read replies for their own tickets
CREATE POLICY "sr_user_read_own"
  ON public.support_replies FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id AND t.user_id = auth.uid()
    )
  );

-- Users: insert replies on their own tickets
CREATE POLICY "sr_user_insert"
  ON public.support_replies FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id AND
    is_admin = false AND
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id AND t.user_id = auth.uid()
    )
  );

-- Admins: read all replies
CREATE POLICY "sr_admin_read"
  ON public.support_replies FOR SELECT TO authenticated
  USING (public.is_admin());

-- Admins: insert replies on any ticket
CREATE POLICY "sr_admin_insert"
  ON public.support_replies FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() AND auth.uid() = author_id);
