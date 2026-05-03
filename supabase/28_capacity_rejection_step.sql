-- ─────────────────────────────────────────────────────────────────────────────
-- 10_capacity_rejection_step.sql
-- Adds two capabilities:
--   1. rejected_step column on listing_submissions — structured rejection routing
--   2. check_listing_availability() — read-only capacity check (for UI)
--   3. create_booking_safe()        — atomic capacity-checked booking insert
-- Depends on: 02_listing_submissions.sql, 03_listings.sql, 05_bookings.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Structured rejection step ─────────────────────────────────────────────
--
-- Maps to the 6-step host listing form:
--   category      → Step 1 (Property Type)
--   description   → Step 2 (About: title, description, highlights)
--   location      → Step 3 (Details: region, location, maps URL)
--   capacity_rules→ Step 3 (Details: capacity, min nights, times)
--   amenities     → Step 4 (Amenities)
--   pricing       → Step 5 (Pricing)
--   media         → Step 6 (Review: images, house rules)

ALTER TABLE public.listing_submissions
  ADD COLUMN IF NOT EXISTS rejected_step TEXT
    CHECK (rejected_step IN (
      'category', 'description', 'location',
      'capacity_rules', 'amenities', 'pricing', 'media'
    ));


-- ── 2. Read-only availability check ──────────────────────────────────────────
--
-- Called by the BookingCard (client component) and the booking server action
-- to show live remaining capacity for a listing + date range.
--
-- SECURITY DEFINER is required: RLS on bookings only lets users see their own
-- bookings, so SECURITY INVOKER would cause User B to miss User A's booking
-- and wrongly report the slot as available.
--
-- Availability model: each listing is a single unit (tent, dome, farm, villa).
-- A confirmed booking for ANY overlapping date range blocks the listing fully.
-- max_guests is a per-booking guest cap, not a cumulative slot counter.
--
-- Returns JSONB:
--   { available: bool, remaining: int, max_guests: int, booked_guests: int }
--   { available: true, remaining: guests, unchecked: true }   ← unlisted slugs
--
-- Date overlap logic (standard half-open interval):
--   existing booking overlaps requested range when:
--   existing.check_in < requested.check_out
--   AND existing.check_out > requested.check_in

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


-- ── 3. Atomic capacity-checked booking insert ─────────────────────────────────
--
-- SECURITY DEFINER: runs as the function owner (postgres) so it can INSERT into
-- bookings regardless of RLS. The first thing it does is verify auth.uid() ==
-- p_user_id to ensure a user can only book as themselves.
--
-- Race condition prevention: SELECT ... FOR UPDATE on the listings row acquires
-- an exclusive row lock for the duration of the transaction. Any concurrent call
-- for the same listing blocks until the first commits/rolls back, making the
-- check-then-insert atomic.
--
-- Returns JSONB:
--   { success: true }
--   { success: false, error: "...", remaining?: int }

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
  -- ── Security: only the authenticated user can book as themselves ──────────
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- ── Basic date sanity ─────────────────────────────────────────────────────
  IF p_check_out <= p_check_in THEN
    RETURN jsonb_build_object('success', false, 'error', 'Check-out must be after check-in.');
  END IF;
  IF p_check_in < CURRENT_DATE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Check-in date cannot be in the past.');
  END IF;

  -- ── Acquire row lock on the listing (prevents concurrent booking races) ───
  SELECT max_guests INTO v_max_guests
  FROM public.listings
  WHERE slug = p_listing_slug
  FOR UPDATE;

  -- ── Capacity check (skipped for unlisted/demo slugs with no row) ─────────
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

  -- ── Insert the confirmed booking ──────────────────────────────────────────
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
