-- ─────────────────────────────────────────────────────────────────────────────
-- 20_reviews.sql
-- Guest reviews — one review per completed booking.
-- Depends on: 01_profiles.sql, 03_listings.sql, 05_bookings.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

  -- UNIQUE on booking_id enforces one-review-per-booking at the DB level.
  booking_id  UUID         NOT NULL UNIQUE REFERENCES public.bookings(id)  ON DELETE CASCADE,
  listing_id  UUID         NOT NULL        REFERENCES public.listings(id)  ON DELETE CASCADE,

  -- host_id is nullable because bookings.host_id is nullable
  -- (manually-seeded listings may have no profiles entry).
  host_id     UUID                         REFERENCES auth.users(id)       ON DELETE SET NULL,
  user_id     UUID         NOT NULL        REFERENCES auth.users(id)       ON DELETE CASCADE,

  rating      SMALLINT     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT         NOT NULL CHECK (char_length(comment) BETWEEN 10 AND 1000),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS reviews_listing_id_idx ON public.reviews (listing_id);
CREATE INDEX IF NOT EXISTS reviews_host_id_idx    ON public.reviews (host_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx    ON public.reviews (user_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone (including unauthenticated visitors) can read reviews.
CREATE POLICY "reviews_select_public"
  ON public.reviews FOR SELECT
  USING (true);

-- Only the booking's guest can insert, and only when the stay is completed
-- (check_out < now() and booking is not cancelled).
CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id      = booking_id
        AND b.user_id = auth.uid()
        AND b.status  != 'cancelled'
        AND b.check_out < CURRENT_DATE
    )
  );
