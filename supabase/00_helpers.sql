-- ─────────────────────────────────────────────────────────────────────────────
-- 00_helpers.sql
-- Security helper functions used by RLS policies across all tables.
-- Safe to execute before profiles exists.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result BOOLEAN := false;
BEGIN
  -- profiles table may not exist yet during initial bootstrap
  IF to_regclass('public.profiles') IS NULL THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  )
  INTO result;

  RETURN result;
END;
$$;