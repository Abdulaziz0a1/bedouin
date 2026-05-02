-- ─────────────────────────────────────────────────────────────────────────────
-- 27_fix_availability_enforcement.sql
-- Fixes two bugs in the capacity / availability system:
--
--   Bug 1 — SECURITY INVOKER on check_listing_availability:
--     RLS on bookings only lets users see their own rows, so a different user
--     checking availability would not see an existing booking and get a false
--     "available" result. Changed to SECURITY DEFINER (same as create_booking_safe)
--     so the function bypasses RLS and sees all confirmed bookings.
--
--   Bug 2 — Guest-count model allows multiple bookings on the same slot:
--     The old logic summed (adults + children) and compared to max_guests, so a
--     2-capacity listing with one 1-guest booking still showed 1 spot remaining
--     and accepted a second booking. Each listing is a single physical unit
--     (tent, dome, farm, villa) — it cannot be shared by two separate parties.
--     Changed both functions to existence-based: ANY confirmed booking for
--     overlapping dates makes the listing unavailable.
--
-- Apply by running this file in the Supabase SQL Editor.
-- Depends on: 05_bookings.sql, 03_listings.sql
-- ─────────────────────────────────────────────────────────────────────────────


-- ── 1. check_listing_availability — SECURITY DEFINER + existence check ───────

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
  v_max_guests  INTEGER;
  v_has_booking BOOLEAN;
BEGIN
  SELECT max_guests INTO v_max_guests
  FROM public.listings
  WHERE slug = p_slug;

  -- Slug not in listings table (unlisted / manually-seeded demo) — skip check
  IF v_max_guests IS NULL THEN
    RETURN jsonb_build_object(
      'available',  true,
      'remaining',  p_requested_guests,
      'unchecked',  true
    );
  END IF;

  -- Any confirmed booking for overlapping dates → listing is unavailable
  SELECT EXISTS (
    SELECT 1 FROM public.bookings
    WHERE listing_slug = p_slug
      AND status       = 'confirmed'
      AND check_in     < p_check_out
      AND check_out    > p_check_in
  ) INTO v_has_booking;

  RETURN jsonb_build_object(
    'available',     NOT v_has_booking,
    'remaining',     CASE WHEN v_has_booking THEN 0 ELSE v_max_guests END,
    'max_guests',    v_max_guests,
    'booked_guests', CASE WHEN v_has_booking THEN v_max_guests ELSE 0 END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_listing_availability(TEXT, DATE, DATE, INTEGER)
  TO authenticated;


-- ── 2. create_booking_safe — existence check (atomic, row-locked) ─────────────

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
  v_max_guests INTEGER;
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

  -- Row lock on the listing prevents concurrent booking races
  SELECT max_guests INTO v_max_guests
  FROM public.listings
  WHERE slug = p_listing_slug
  FOR UPDATE;

  -- Availability check: any confirmed overlapping booking → reject
  -- Skipped for unlisted/demo slugs (no row in listings table)
  IF v_max_guests IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.bookings
      WHERE listing_slug = p_listing_slug
        AND status       = 'confirmed'
        AND check_in     < p_check_out
        AND check_out    > p_check_in
    ) THEN
      RETURN jsonb_build_object(
        'success',   false,
        'remaining', 0,
        'error',     'This listing is fully booked for the selected dates.'
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
