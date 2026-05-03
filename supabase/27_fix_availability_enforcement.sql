-- ─────────────────────────────────────────────────────────────────────────────
-- 27_fix_availability_enforcement.sql
-- Fixes the capacity / availability enforcement system.
--
--   Root cause — SECURITY INVOKER on check_listing_availability:
--     RLS on bookings only lets users see their own rows. When User B checks
--     availability for a listing booked by User A, the function runs as User B
--     (SECURITY INVOKER), hits the RLS filter, misses User A's booking, and
--     returns available=true. Exact-same-date tests appeared to work only because
--     the same user was making both bookings (could see their own row).
--     Fix: SECURITY DEFINER — runs as the function owner (postgres), bypasses
--     RLS, and sees ALL confirmed bookings. Same approach as create_booking_safe.
--
--   Capacity model — cumulative guest count:
--     Both functions sum (adults + children) from all confirmed bookings with
--     overlapping dates, then compare the remainder to the requested guest count.
--     Overlap condition (standard half-open interval):
--       existing.check_in  < requested.check_out
--       existing.check_out > requested.check_in
--
-- Apply by running this file in the Supabase SQL Editor.
-- Depends on: 05_bookings.sql, 03_listings.sql
-- ─────────────────────────────────────────────────────────────────────────────


-- ── 1. check_listing_availability — SECURITY DEFINER + guest-count model ─────

CREATE OR REPLACE FUNCTION public.check_listing_availability(
  p_slug             TEXT,
  p_check_in         DATE,
  p_check_out        DATE,
  p_requested_guests INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_max_guests INTEGER;
  v_booked     INTEGER;
  v_remaining  INTEGER;
BEGIN
  SELECT max_guests INTO v_max_guests
  FROM public.listings
  WHERE slug = p_slug;

  -- Slug not in listings table (unlisted / demo slug) — skip enforcement
  IF v_max_guests IS NULL THEN
    RETURN jsonb_build_object(
      'available',  true,
      'remaining',  p_requested_guests,
      'unchecked',  true
    );
  END IF;

  -- Sum guests from all confirmed bookings that overlap the requested range.
  -- Overlap: existing.check_in < p_check_out AND existing.check_out > p_check_in
  SELECT COALESCE(SUM(adults + children), 0) INTO v_booked
  FROM public.bookings
  WHERE listing_slug = p_slug
    AND status       = 'confirmed'
    AND check_in     < p_check_out
    AND check_out    > p_check_in;

  v_remaining := GREATEST(0, v_max_guests - v_booked);

  RETURN jsonb_build_object(
    'available',     v_remaining >= p_requested_guests,
    'remaining',     v_remaining,
    'max_guests',    v_max_guests,
    'booked_guests', v_booked
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_listing_availability(TEXT, DATE, DATE, INTEGER)
  TO authenticated;


-- ── 2. create_booking_safe — guest-count model (atomic, row-locked) ───────────

CREATE OR REPLACE FUNCTION public.create_booking_safe(
  p_id               UUID,
  p_reference        TEXT,
  p_user_id          UUID,
  p_listing_slug     TEXT,
  p_listing_category TEXT,
  p_listing_title    TEXT,
  p_location         TEXT,
  p_image            TEXT,
  p_check_in         DATE,
  p_check_out        DATE,
  p_nights           INTEGER,
  p_adults           INTEGER,
  p_children         INTEGER,
  p_subtotal         NUMERIC,
  p_service_fee      NUMERIC,
  p_total_price      NUMERIC,
  p_guest_name       TEXT,
  p_guest_email      TEXT,
  p_guest_phone      TEXT,
  p_guest_nationality TEXT,
  p_special_requests  TEXT,
  p_payment_method   TEXT,
  p_host_id          UUID,
  p_host_name        TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_max_guests       INTEGER;
  v_booked           INTEGER;
  v_remaining        INTEGER;
  v_requested_guests INTEGER;
BEGIN
  -- Only the authenticated user can book as themselves
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Basic date sanity
  IF p_check_out <= p_check_in THEN
    RETURN jsonb_build_object('success', false, 'error', 'Check-out must be after check-in.');
  END IF;
  IF p_check_in < CURRENT_DATE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Check-in date cannot be in the past.');
  END IF;

  -- Row lock on the listing row prevents concurrent booking races
  SELECT max_guests INTO v_max_guests
  FROM public.listings
  WHERE slug = p_listing_slug
  FOR UPDATE;

  -- Capacity check — skipped for unlisted/demo slugs (no row in listings table)
  IF v_max_guests IS NOT NULL THEN
    v_requested_guests := p_adults + p_children;

    SELECT COALESCE(SUM(adults + children), 0) INTO v_booked
    FROM public.bookings
    WHERE listing_slug = p_listing_slug
      AND status       = 'confirmed'
      AND check_in     < p_check_out
      AND check_out    > p_check_in;

    v_remaining := GREATEST(0, v_max_guests - v_booked);

    IF v_remaining < v_requested_guests THEN
      RETURN jsonb_build_object(
        'success',   false,
        'remaining', v_remaining,
        'error',     CASE
          WHEN v_remaining = 0
            THEN 'This listing is fully booked for the selected dates.'
          ELSE format(
            'Only %s spot(s) remaining for these dates. You requested %s guests.',
            v_remaining, v_requested_guests
          )
        END
      );
    END IF;
  END IF;

  -- Insert the confirmed booking
  INSERT INTO public.bookings (
    id, reference, user_id,
    listing_slug, listing_category, listing_title, location, image,
    check_in, check_out, nights, adults, children,
    subtotal, service_fee, total_price,
    guest_name, guest_email, guest_phone, guest_nationality, special_requests,
    payment_method, host_id, host_name, status
  ) VALUES (
    p_id, p_reference, p_user_id,
    p_listing_slug, p_listing_category, p_listing_title, p_location, p_image,
    p_check_in, p_check_out, p_nights, p_adults, p_children,
    p_subtotal, p_service_fee, p_total_price,
    p_guest_name, p_guest_email, p_guest_phone, p_guest_nationality, p_special_requests,
    p_payment_method, p_host_id, p_host_name, 'confirmed'
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_booking_safe(
  UUID, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT,
  DATE, DATE, INTEGER, INTEGER, INTEGER,
  NUMERIC, NUMERIC, NUMERIC,
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT
) TO authenticated;
