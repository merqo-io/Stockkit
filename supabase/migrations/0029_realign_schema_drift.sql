-- 0029_realign_schema_drift.sql
-- Environments diverged from what the migrations define: the vendor-avatars
-- write policies were never applied, a check constraint was edited by hand on
-- prod, and a service_role privilege differs by server version. This file
-- re-asserts the defined state and is a no-op on a database already correct.

-- 0006's write policies, restated verbatim. The public_read policy and the
-- bucket row are deliberately left alone.
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

-- Prod's constraint was widened by hand to allow 'consumed'. Restore the
-- four values from 0001 under the same name.
ALTER TABLE stockkit.stock_movements
  DROP CONSTRAINT IF EXISTS stock_movements_reason_check;
ALTER TABLE stockkit.stock_movements
  ADD CONSTRAINT stock_movements_reason_check
  CHECK (reason IN ('restock', 'waste', 'adjustment', 'initial'));

-- The ledger is append-only for service_role. 0001's `grant all` also hands
-- out MAINTAIN on Postgres 17+, which no later migration revokes, so
-- privileges would depend on the server version. Reset and grant the narrow
-- set explicitly (MAINTAIN is not named: it does not parse before PG17).
REVOKE ALL ON stockkit.stock_movements FROM service_role;
GRANT SELECT, INSERT, REFERENCES, TRIGGER ON stockkit.stock_movements TO service_role;
