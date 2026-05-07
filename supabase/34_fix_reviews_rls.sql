-- ─────────────────────────────────────────────────────────────────────────────
-- 34_fix_reviews_rls.sql
-- Fixes the reviews INSERT policy so guests can submit a review on the day
-- they check out (check_out = CURRENT_DATE), not only on the day *after*.
--
-- The original policy used `b.check_out < CURRENT_DATE` (strictly less).
-- The server action used `new Date(booking.check_out) >= new Date()` which
-- evaluates midnight-of-checkout < current-time, so it passes on checkout day.
-- This mismatch caused the "new row violates row-level security policy" error.
--
-- Fix: change to `b.check_out <= CURRENT_DATE` so both sides agree.
--
-- Safe to re-run: DROP POLICY IF EXISTS + CREATE POLICY.
-- Depends on: 20_reviews.sql
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;

CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id      = booking_id
        AND b.user_id = auth.uid()
        AND b.status  != 'cancelled'
        AND b.check_out <= CURRENT_DATE
    )
  );
