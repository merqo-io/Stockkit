# src/app/dashboard/products

The products workspace — list, add/edit, log stock movements, and view a
product's movement history.

## Contents

- `page.tsx` — server fetch of the vendor's products, renders
  `ProductsWorkspace`.
- The Archive button on the Edit tab archives at once in the UI and shows @merqo/ui's `undoToast`. `archiveProduct` runs only when the toast settles without Undo (expiry or dismissal), so Undo never re-activates a product and never meets the Free plan's active-product cap. The pending archive is held in `pending-archives.ts`, a module-level registry keyed by product id: Restore and Save cancel it (the commit is then skipped), a second Archive on the same product is ignored, and hiding the page (`visibilitychange` to hidden, `pagehide`) commits every pending archive at once. A failed commit toasts the error and rolls back only `is_active` on the current row through `onArchiveRolledBack`. A hard kill of the browser or a dropped request inside the toast window can still lose the archive; the product then simply stays active. The Restore button on an archived product stays.
- The "All" filter lists active products only; archived products appear under "Archived". The filter is `@merqo/ui`'s `SegmentedControl`, a radiogroup, so tests query `role="radio"` and `aria-checked`.
- `page.tsx` also reads the vendor tier for the Free "N of 20 active" meter and the optional `?product=<id>` preselect (linked from the overview "Needs attention" rows).
- `products-workspace.tsx` — client state/shell (PageHeader, All/Low/Out/Archived filter, name search, one Add button, one list for both breakpoints): holds the product list,
  selected product, and which panel (`ProductForm`/`StockLogForm`/
  `ProductDetail`) is open. The desktop two-pane layout's detail panel
  (empty placeholder / new-product form / selected product) is picked by
  `renderDetailPanel()`, extracted out of the JSX to avoid a nested
  ternary. Tested in `products-workspace.dom.test.tsx` (mocks
  `ProductForm`/`ProductDetail`/`ProductRow`, covers the desktop panel's
  three states).
- `product-row.tsx` — one row in the list (name, unit, on-hand, stock
  status dot via the shared `StockStatusIndicator`, `@/components`; `aria-pressed` marks the selected row; "Low at N unit" threshold line;
  inactive products show "Archived" instead of a stock status).
- `product-form.tsx` — create/edit form. Starting quantity is only
  editable when creating a new product; an existing product's `on_hand`
  only ever moves through `StockLogForm`. The unit field is a
  `UnitPicker`, a shadcn `Command` plus `@merqo/ui/primitives` `Popover` combobox (free text plus
  `UNIT_PRESETS` suggestions), replacing a raw `<input list>`/`<datalist>` for
  consistent cross-browser rendering. The unit-cost field is
  `@merqo/ui`'s `MoneyInput` (the same one qkit's menu prices use): it
  only commits a parseable, non-negative amount and snaps back to the
  last valid value on blur, so there is no separate inline cost error.
  The low-stock threshold carries a tap `InfoTooltip` explaining when a
  product counts as low. Its save/archive handlers wrap their
  server-action call in `try/catch` — a thrown rejection still shows a
  generic toast instead of failing silently. Tested in
  `product-form.dom.test.tsx`.
- `stock-log-form.tsx` — records a stock movement (restock/waste/
  adjustment) for one product. Same `MoneyInput` unit-cost field and
  `try/catch` handling as `product-form.tsx`; the restock cost's
  `InfoTooltip` notes it is stored on the ledger row only and does not
  change the product's unit cost. Tested in
  `stock-log-form.dom.test.tsx`.
- `movement-history.tsx` — read-only ledger view for a product. Tested in
  `movement-history.dom.test.tsx` (loading/empty/error/populated states,
  refetch on `refreshKey` change).
- `product-detail.tsx` — product detail panel: header (status, on-hand) over
  Log stock / Edit / History tabs on both desktop and mobile; the History tab
  holds `export-history-button.tsx` ("Download CSV", a disabled lock
  button on Free) above the ledger. The Active switch is gone from
  the product form; Archive is the only way to deactivate, and an archived
  product's Edit tab shows a Restore product button (cap-checked on Free). Form validation
  errors render inline under the field (`aria-describedby`); toasts are for
  server results only. `getProductMovements` also returns the plan's
  `limit`, so Free history shows a "Full history is not available yet" notice; stock status via the shared
  `StockStatusIndicator`, same as `product-row.tsx`.
- `actions.ts` provides `saveProduct`, `archiveProduct`,
  `recordStockMovement`, `getProductMovements` and `exportProductMovementsCsv`.
  Archiving marks a product inactive, retains its stock history and records an
  audit entry. Products remain editable and can be reactivated. Migration 0018
  prevents product/vendor/account deletion from cascading through ledger rows
  and records opening stock in the same transaction as product creation.
  Pro history and CSV exports use ordered cursor pagination; a failed page
  rejects the complete export. Free history retains its ten-row limit.
  A shared `vendorEntitlement(supabase, vendorId)` helper resolves the
  vendor's tier via `@/lib/vendor-entitlement`'s `readVendorTier` (the merqo
  entitlement cache) and `@/lib/plan`'s `ENTITLEMENTS`, and is
  used by all three plan-gated actions. It fails **closed** — a plan lookup
  that errors degrades to Free rather than Pro — but logs the error, so a
  DB outage silently downgrading a paying vendor leaves a trace:
  - `saveProduct`'s insert branch: Free vendors are capped at
    `maxActiveProducts` active products and get a friendly rejection once at
    the cap; Pro is unlimited (`maxActiveProducts: null` skips the check
    entirely). The edit branch checks the same cap, but only when the update
    flips `is_active` false→true (a reactivation) — fetches the existing
    row first so an ordinary edit to an already-active product is never
    blocked just because the vendor is at cap on other rows. Both checks are
    a fast, friendly-error first line of defence only — the enforcement that
    actually holds is in `supabase/migrations/0011_product_limit_rls.sql`
    (insert) and `0012_product_reactivation_limit.sql` (reactivation),
    which a direct browser-side `from('products').insert/update(...)`
    cannot route around: RLS policies/functions catch the ordinary
    single-row case, and statement-level triggers with transition tables
    are what hold for a multi-row batch, which a per-row `WITH CHECK`
    structurally cannot see the whole of.
  - `getProductMovements`: capped at `movementHistoryLimit` rows (10) on
    Free; unlimited on Pro (`movementHistoryLimit: null` skips `.limit()`).
  - `exportProductMovementsCsv(productId)`: Pro-only (`entitlement.csvExport`),
    returns the product's full stock-movement ledger as CSV text
    (`date,reason,delta,note` header + one row per movement) or a friendly
    rejection on Free. Fields are RFC 4180-escaped (`csvField` helper) so a
    note containing a comma, double quote, or newline can't corrupt the
    output. The History tab's "Download CSV" button calls it.

  Tested in `actions.test.ts`.

All `.dom.test.tsx` files rely on `test/setup.ts`'s global RTL `cleanup()`
and no-op `ResizeObserver` stub (needed for the Radix `Switch`/`Select`
primitives each form uses) instead of declaring their own.

## Parent

[dashboard](../README.md)

Product selection keys both detail layouts by product ID. Switching products resets
unsaved edit and movement drafts; an integration test exercises the real forms
and verifies the second product is saved with its own name and costs. History
read errors display an alert and retry action instead of an empty ledger.

`export-history-button.tsx` exposes the existing Pro CSV action in both history layouts. Failed exports show an actionable error and retry; object URLs are revoked after download. Authorization and formula-safe escaping remain in the server action.

Product and stock-movement reads list their columns (`PRODUCT_COLUMNS`, `STOCK_MOVEMENT_COLUMNS`).

The page sets `metadata.title` "Products" (rendered through the root `%s | stockkit` template) and relies on the dashboard layout for top padding.

UI primitives (badge, card, dialog, input, label, select, switch, textarea) and `cn` used here come from `@merqo/ui/primitives`, not local copies.

Field errors render through `@merqo/ui`'s `FormError`, and the "No products yet" and "No matching products" lists use its `EmptyState`.

Movement history times render via `@merqo/ui` `Timestamp` (Singapore time).

Buttons here come from `@merqo/ui/primitives` (the shared `Button`), not a local copy.
