-- ─────────────────────────────────────────────────────────────────────────────
-- 16_messages.sql
-- Simple MVP messaging between users (Tourist↔Host, Host↔Co-host).
--
-- No realtime, no read receipts — read-optimised for simple thread display.
-- Safe to re-run: IF NOT EXISTS + DROP POLICY IF EXISTS.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.messages (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  sender_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Optional context links (denormalised for display; no hard FK constraint
  -- on listing_slug since bookings don't FK to listings)
  related_listing_id  UUID        REFERENCES public.listings(id) ON DELETE SET NULL,
  related_booking_id  UUID        REFERENCES public.bookings(id) ON DELETE SET NULL,

  content             TEXT        NOT NULL CHECK (char_length(trim(content)) > 0),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_sender_idx   ON public.messages (sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_idx ON public.messages (receiver_id);
CREATE INDEX IF NOT EXISTS messages_thread_idx   ON public.messages (sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_created_idx  ON public.messages (created_at DESC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages they sent or received
DROP POLICY IF EXISTS "messages_select_own" ON public.messages;
CREATE POLICY "messages_select_own"
  ON public.messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Users can only insert messages as themselves
DROP POLICY IF EXISTS "messages_insert_own" ON public.messages;
CREATE POLICY "messages_insert_own"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());
