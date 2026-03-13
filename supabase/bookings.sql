-- public.bookings table
-- Safe to re-run

CREATE TABLE IF NOT EXISTS public.bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  host_id           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  listing_id        UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,

  host_name         TEXT,
  listing_title     TEXT NOT NULL,
  listing_category  TEXT,

  check_in          DATE NOT NULL,
  check_out         DATE NOT NULL,
  guests            INTEGER NOT NULL DEFAULT 1 CHECK (guests > 0),

  total_price       NUMERIC(10,2) NOT NULL DEFAULT 0,

  status            TEXT NOT NULL DEFAULT 'confirmed'
                    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT bookings_date_order_check CHECK (check_out > check_in)
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_bookings_updated_at ON public.bookings;
CREATE TRIGGER set_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Users can read their own bookings
DROP POLICY IF EXISTS "users_read_own_bookings" ON public.bookings;
CREATE POLICY "users_read_own_bookings"
ON public.bookings
FOR SELECT
USING (auth.uid() = user_id);

-- Hosts can read bookings for their own listings
DROP POLICY IF EXISTS "hosts_read_own_listing_bookings" ON public.bookings;
CREATE POLICY "hosts_read_own_listing_bookings"
ON public.bookings
FOR SELECT
USING (auth.uid() = host_id);

-- Users can insert their own bookings
DROP POLICY IF EXISTS "users_insert_own_bookings" ON public.bookings;
CREATE POLICY "users_insert_own_bookings"
ON public.bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
DROP POLICY IF EXISTS "users_update_own_bookings" ON public.bookings;
CREATE POLICY "users_update_own_bookings"
ON public.bookings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can read all bookings
DROP POLICY IF EXISTS "admins_read_all_bookings" ON public.bookings;
CREATE POLICY "admins_read_all_bookings"
ON public.bookings
FOR SELECT
USING (public.is_admin());

-- Admins can update all bookings
DROP POLICY IF EXISTS "admins_update_all_bookings" ON public.bookings;
CREATE POLICY "admins_update_all_bookings"
ON public.bookings
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_bookings_user_id
  ON public.bookings(user_id);

CREATE INDEX IF NOT EXISTS idx_bookings_host_id
  ON public.bookings(host_id);

CREATE INDEX IF NOT EXISTS idx_bookings_listing_id
  ON public.bookings(listing_id);

CREATE INDEX IF NOT EXISTS idx_bookings_status
  ON public.bookings(status);

CREATE INDEX IF NOT EXISTS idx_bookings_check_in
  ON public.bookings(check_in);

CREATE INDEX IF NOT EXISTS idx_bookings_created_at
  ON public.bookings(created_at DESC);