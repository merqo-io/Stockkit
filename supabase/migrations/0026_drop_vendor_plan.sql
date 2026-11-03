-- 0026_drop_vendor_plan.sql
-- Legacy Pro vendors become paid with no expiry; merqo's next push replaces
-- the row. issued_at is the epoch so any real push wins the ordering check.
INSERT INTO stockkit.vendor_entitlements (vendor_id, tier, founder, stats_window, valid_until, issued_at)
  SELECT id, 'paid', false, '24h', NULL, to_timestamp(0)
  FROM stockkit.vendors
  WHERE plan = 'pro'
  ON CONFLICT (vendor_id) DO NOTHING;

-- Dropping the column also drops its column-level grants (0010).
ALTER TABLE stockkit.vendors DROP COLUMN plan;
