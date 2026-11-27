// Every string here is rendered by the signed-in app; the source file is noted
// so a copy change in the app shows up in review of this file.

/** app/dashboard/(overview)/page.tsx */
export const OVERVIEW_TITLE = 'Overview';
export const INVENTORY_VALUE = 'Inventory value';
export const LOW_STOCK = 'Low stock';
export const OUT_OF_STOCK = 'Out of stock';
export const NEEDS_ATTENTION = 'Needs attention';
export const VIEW_ALL = 'View all products';

/** lib/stock.ts STOCK_STATUS_LABEL */
export const STATUS_LOW = 'Low';

/** app/dashboard/products/product-form.tsx */
export const FIELD_NAME = 'Name';
export const FIELD_UNIT = 'Unit';
export const FIELD_UNIT_COST = 'Unit cost ($)';
export const FIELD_STARTING_QUANTITY = 'Starting quantity';
export const FIELD_THRESHOLD = 'Low-stock threshold';
export const ADD_PRODUCT_BUTTON = 'Add product';

/** app/dashboard/products/stock-log-form.tsx */
export const FIELD_REASON = 'Reason';
export const REASON_RESTOCK = 'Restock';
export const FIELD_QUANTITY = 'Quantity';
export const RESTOCK_LOGGED = 'Restock logged';

/** Same template as submitLabel() in stock-log-form.tsx. */
export function restockButton(quantity: number, unit: string): string {
  return `Log restock of ${quantity} ${unit}`;
}

/** app/dashboard/(overview)/page.tsx: "Low at {threshold} {unit}". */
export function lowAt(threshold: number, unit: string): string {
  return `Low at ${threshold} ${unit}`;
}

/** app/dashboard/products/product-detail.tsx: "{unit} on hand". */
export function onHand(unit: string): string {
  return `${unit} on hand`;
}

// Sample product, not a real vendor's data.
export const SAMPLE = {
  name: 'Oat milk',
  unit: 'L',
  unitCost: '4.50',
  unitCostCents: 450,
  startQuantity: 12,
  threshold: 6,
  restockQuantity: 12,
  lowOnHand: 4,
} as const;
