// Explicit column lists for every table read, so a new column is never returned by default.

export const PRODUCT_COLUMNS =
  'id, vendor_id, name, unit, unit_cost_cents, on_hand, low_stock_threshold, is_active, created_at, updated_at' as const;

export const STOCK_MOVEMENT_COLUMNS =
  'id, vendor_id, product_id, delta, reason, note, unit_cost_cents, created_at' as const;
