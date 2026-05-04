-- ─────────────────────────────────────────────────────────────────────────────
-- 31_messages_soft_delete.sql
-- Adds soft-delete support to messages: is_deleted flag + UPDATE RLS.
-- Safe to re-run: IF NOT EXISTS + DROP POLICY IF EXISTS.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

-- Senders can soft-delete their own messages by flipping is_deleted.
DROP POLICY IF EXISTS "messages_update_own" ON public.messages;
CREATE POLICY "messages_update_own"
  ON public.messages FOR UPDATE
  TO authenticated
  USING  (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());
