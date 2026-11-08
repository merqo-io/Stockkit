-- supabase/migrations/0006_vendor_avatars_bucket.sql
-- Public-read bucket for vendor profile-icon uploads (the /dashboard/profile
-- "profile icon" section — docs/business/2026-07-21-profile-settings-page-standard.md).
-- Size/MIME limits are baked in from the start here, unlike qkit's
-- booth-images bucket, which shipped unconstrained and was hardened in a
-- later migration (0037_booth_images_bucket_limits.sql) — no reason to
-- repeat that two-step history.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('vendor-avatars', 'vendor-avatars', true, 5242880,
        ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- storage.objects is shared by every kit in the one Supabase project, and
-- merqo's 0015 creates a policy with this same name; dropping first keeps a
-- fresh bootstrap from failing whichever kit's migration runs first.
DROP POLICY IF EXISTS "vendor_avatars_public_read" ON storage.objects;

-- Anyone may read avatars (they render in the account-menu avatar, which
-- has no auth gate on the image request itself).
CREATE POLICY "vendor_avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vendor-avatars');

-- A vendor may write only under their own "{auth.uid()}/..." path.
DROP POLICY IF EXISTS "vendor_avatars_vendor_insert" ON storage.objects;
CREATE POLICY "vendor_avatars_vendor_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'vendor-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "vendor_avatars_vendor_update" ON storage.objects;
CREATE POLICY "vendor_avatars_vendor_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'vendor-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "vendor_avatars_vendor_delete" ON storage.objects;
CREATE POLICY "vendor_avatars_vendor_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'vendor-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
