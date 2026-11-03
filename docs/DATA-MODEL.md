# Data model

Moved out of `AGENTS.md` to keep the always-loaded context small. The
rule-like sentences (immutable ledger, single stock write path, RLS-only
access, 5-year retention) are also summarised in `AGENTS.md`.

- `vendors` (id = `auth.users.id`, stall name).
- `products` — belong to a vendor; `on_hand` (numeric, live balance),
  `unit_cost_cents`, `low_stock_threshold`, `is_active`.
- `stock_movements` — append-only ledger (`restock` / `waste` / `adjustment` /
  `initial`). No update/delete RLS policy — default-deny keeps it immutable,
  even for the row's own owner.
- The only write path for a stock change is `stockkit.record_stock_movement`
  (SECURITY INVOKER — the caller is always the vendor acting on their own
  data, so RLS already authorizes it): applies the delta to `on_hand`,
  rejects a move that would take it below zero, and appends the ledger row,
  atomically (one function body = one implicit transaction).
- RLS: a vendor sees/edits only their own `vendors` row, `products`, and
  `stock_movements`. No public read of anything — unlike qkit's booths, none
  of this data ever needs to be public.
- `stockkit.sync_vendor_profile` (SECURITY DEFINER) forwards a vendor's stall
  name to the shared `merqo.patch_vendor_profile` RPC, preserving social links on signup — best-effort,
  never blocks or fails signup if it errors.
- `vendor_entitlements` (`0025`): cache of the entitlement merqo pushes to `POST /api/merqo/entitlement`. Own-row select RLS, writes only through the service-role `apply_vendor_entitlement` (newer `issued_at` wins). Paid means tier `paid` and `valid_until` null or in the future (`vendor_is_paid`), which drives `active_product_cap`. `vendors.plan` (`0026`) and `pricing` (`0027`) were dropped.
- `admins`/`admin_audit` (`0013_stockkit_admin.sql`): platform-operator
  allow-list and audit trail — one row per admin- or vendor-initiated action
  worth reconstructing later (a vendor's own
  `delete_product` — see `recordAudit()` in `src/lib/audit.ts`, shared by
  `src/app/dashboard/products/actions.ts`).
  RLS is admin-read-only; the service-role client can `select`/`insert` on
  both `admin_audit` and `stock_movements` but not `update`/`delete`
  (`0015_audit_immutability.sql`) — neither table is ever updated or deleted
  by the app, so closing that off at the grant level costs nothing and means
  a compromised service-role key still can't rewrite either trail.
  **Retention: keep `admin_audit` and `stock_movements` rows for 5 years**,
  matching IRAS's record-keeping norm for a small Singapore business; no
  archival/purge job exists yet — this is the stated policy so retention
  isn't decided ad hoc later.
