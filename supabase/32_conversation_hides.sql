-- ─────────────────────────────────────────────────────────────────────────────
-- 32_conversation_hides.sql
-- Per-user soft-hide for inbox conversations.
-- A hidden conversation disappears from the inbox until a new message arrives
-- after hidden_at, at which point it reappears automatically.
-- Safe to re-run: IF NOT EXISTS + DROP POLICY IF EXISTS.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.conversation_hides (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  other_user_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hidden_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, other_user_id)
);

CREATE INDEX IF NOT EXISTS conversation_hides_user_idx
  ON public.conversation_hides (user_id);

ALTER TABLE public.conversation_hides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conv_hides_select_own" ON public.conversation_hides;
CREATE POLICY "conv_hides_select_own"
  ON public.conversation_hides FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "conv_hides_insert_own" ON public.conversation_hides;
CREATE POLICY "conv_hides_insert_own"
  ON public.conversation_hides FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Required for upsert (INSERT ON CONFLICT DO UPDATE)
DROP POLICY IF EXISTS "conv_hides_update_own" ON public.conversation_hides;
CREATE POLICY "conv_hides_update_own"
  ON public.conversation_hides FOR UPDATE
  TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "conv_hides_delete_own" ON public.conversation_hides;
CREATE POLICY "conv_hides_delete_own"
  ON public.conversation_hides FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
