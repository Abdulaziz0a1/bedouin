-- ─────────────────────────────────────────────────────────────────────────────
-- 11_admin_setup.sql
-- Promotes an existing user to the admin role.
--
-- IMPORTANT: You cannot sign up as admin through the normal signup flow.
-- You must:
--   1. Create the account via the normal /signup page with your chosen email.
--   2. Run this SQL in the Supabase SQL Editor (as service role) to promote that
--      account to admin.
--   3. Sign in with that account — you will be redirected to /admin.
--
-- Replace 'your-admin-email@example.com' with the real email you signed up with.
-- ─────────────────────────────────────────────────────────────────────────────

-- Step 1: Find the user ID by email (run this to verify before promoting)
-- SELECT id, email FROM auth.users WHERE email = 'your-admin-email@example.com';

-- Step 2: Promote the user to admin role
UPDATE public.profiles
SET
  role        = 'admin',
  active_mode = 'tourist'   -- admins stay in tourist mode; admin panel is role-gated, not mode-gated
WHERE id = (
  SELECT id
  FROM auth.users
  WHERE email = 'abdulaziz.h.alharbi.10@gmail.com'
  LIMIT 1
);

-- Step 3: Verify the promotion
-- SELECT id, role, active_mode FROM public.profiles
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com');

-- ─────────────────────────────────────────────────────────────────────────────
-- DEMO ACCOUNTS CHECKLIST (fill in your actual emails after creating them)
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Admin:    sign up with admin@bedouin.test   → run this file to promote
-- Tourist:  sign up with tourist@bedouin.test → no DB step needed (auto profile created)
-- Host:     sign up with host@bedouin.test    → apply via /host/onboarding → admin approves
-- Co-host:  sign up with cohost@bedouin.test  → apply via /provide-service → admin approves
--
-- After the admin approves a host application, the host can:
--   1. Switch to Host mode via the Navbar
--   2. Go to /host/new to create a listing
--   3. Admin reviews and approves the listing via /admin
--   4. Listing appears live on /explore
-- ─────────────────────────────────────────────────────────────────────────────
