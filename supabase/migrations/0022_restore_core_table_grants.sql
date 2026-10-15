-- 0001's table grants were added after it had already run in production, so
-- production never received them. Restate the net intended grants (0001 as
-- narrowed by 0010, 0015, 0019 and 0021). GRANT is idempotent.

GRANT SELECT ON stockkit.vendors TO authenticated;
GRANT INSERT (id, name) ON stockkit.vendors TO authenticated;
GRANT UPDATE (id, name, tour_seen_at) ON stockkit.vendors TO authenticated;
GRANT ALL ON stockkit.vendors TO service_role;

GRANT SELECT, INSERT, DELETE ON stockkit.products TO authenticated;
GRANT UPDATE (name, unit, unit_cost_cents, low_stock_threshold, is_active)
  ON stockkit.products TO authenticated;
GRANT ALL ON stockkit.products TO service_role;

GRANT SELECT ON stockkit.stock_movements TO authenticated;
GRANT SELECT, INSERT, REFERENCES, TRIGGER ON stockkit.stock_movements TO service_role;
