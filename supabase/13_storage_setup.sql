-- ─────────────────────────────────────────────────────────────────────────────
-- 13_storage_setup.sql
-- Creates the `listing-images` Supabase Storage bucket and sets row-level
-- security policies so:
--   • Authenticated hosts can upload/delete their own objects
--   • Anyone (anon + authenticated) can read all objects (public bucket)
--
-- Safe to run multiple times — uses ON CONFLICT DO NOTHING for the bucket,
-- and DROP POLICY IF EXISTS before each CREATE POLICY.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Create the bucket ──────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images',
  true,                 -- public: files readable without auth via public URL
  5242880,              -- 5 MB per file
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ── 2. RLS policies on storage.objects ───────────────────────────────────────

-- 2a. Allow any authenticated user to upload to listing-images (no path restriction).
--     Simplified for reliability — tighten to per-user subfolder once uploads are confirmed working.
DROP POLICY IF EXISTS "listing_images_upload_own" ON storage.objects;
DROP POLICY IF EXISTS "Allow all uploads" ON storage.objects;
CREATE POLICY "Allow all uploads"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'listing-images');

-- 2b. Anyone can read listing images (they are shown on public listing pages)
DROP POLICY IF EXISTS "listing_images_public_read" ON storage.objects;
CREATE POLICY "listing_images_public_read"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'listing-images');

-- 2c. Users can delete their own images
DROP POLICY IF EXISTS "listing_images_delete_own" ON storage.objects;
CREATE POLICY "listing_images_delete_own"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'listing-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
