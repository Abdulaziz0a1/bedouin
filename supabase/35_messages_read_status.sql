-- ─────────────────────────────────────────────────────────────────────────────
-- 35_messages_read_status.sql
-- Adds read-receipt support: is_read flag on messages so the receiver can
-- mark a message as read.  Used by the unread-badge in the Navbar.
--
-- Design:
--   • is_read defaults to FALSE (new messages start unread for the receiver).
--   • The receiver marks all messages in a thread as read via a single UPDATE.
--   • The sender's own messages are never "unread" from their perspective —
--     the badge only counts rows where receiver_id = auth.uid() AND is_read = FALSE.
--
-- The existing "messages_update_own" policy (31_messages_soft_delete.sql) only
-- allows the SENDER to update their messages.  We add a second policy that
-- allows the RECEIVER to flip is_read, which is the only column they need to touch.
--
-- Safe to re-run: IF NOT EXISTS + DROP POLICY IF EXISTS.
-- Depends on: 16_messages.sql, 31_messages_soft_delete.sql
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS messages_unread_idx
  ON public.messages (receiver_id, is_read)
  WHERE is_read = FALSE;

-- Allow the receiver to mark messages as read (flip is_read only).
DROP POLICY IF EXISTS "messages_mark_read" ON public.messages;
CREATE POLICY "messages_mark_read"
  ON public.messages FOR UPDATE
  TO authenticated
  USING  (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());
