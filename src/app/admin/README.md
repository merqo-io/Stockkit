# admin

## Purpose

Merqo-team internal admin console — the gated layout, shared nav, and shared
figure-tile helper used by the overview and vendors screens. Ported from
loopkit's proven `src/app/admin/` pattern, adapted to stockkit's own
vendors/products/stock_movements domain (no "programs" concept here).

## Contents

- `admin-nav.tsx` — `AdminNav` client component: the Overview/Vendors/Activity tab bar, highlighting the active section by path.
- `layout.tsx` — `AdminLayout`: gates every `/admin` route with `requireAdmin()`, renders the header (`BrandText` wordmark, Admin badge, sign-out) and `AdminNav`.
- `page.tsx`, `AdminOverviewPage`: platform-wide totals (vendors by plan, products, active products, stock movements recorded), a recent cross-vendor activity feed (wrapped in `@merqo/ui`'s `ElevatedCard`), and nothing else: pricing and plan changes live in merqo.
- `stat.tsx` — `Stat`: a small labeled-value tile (built on `@merqo/ui`'s `ElevatedCard` and `StatTile` for the shell and label/value content, both promoted 2026-09-16 — `ElevatedCard` was stockkit-local before, `StatTile` already shared — `font-mono` value per this app's ledger typographic convention) used on the admin overview page.
- `vendors/`, vendor list with each vendor's plan badge (own README).
- `activity/` — the `admin_audit` viewer, rendered via `@merqo/ui`'s shared
  `AuditLogTable` (own README).

## Connectivity

`vendors/` and `activity/` are the two admin sections linked from
`admin-nav.tsx`'s tab bar besides the overview page itself; all three render
inside `layout.tsx`'s gated shell. This folder's own `page.tsx` reads
`platformTotals()` and `recentActivity()` from `@/lib/admin-data`, rendering
each total in a `stat.tsx` `Stat` tile. `vendors/page.tsx` reads
`listVendors()` from the same module and renders its own table (no `Stat`
tiles there). `activity/page.tsx` reads `auditLog()` from
the same module — a separate feed from `recentActivity()`'s stock-movement
ledger, since `admin_audit` and `stock_movements` are different tables
answering different questions ("what did an admin/vendor do" vs. "what
stock moved").

## Parent

[app](../README.md)

Movement reason labels use `stockMovementReasonLabel` from `@/lib/stock`, including a raw-label fallback for unknown values.

Every page and action is gated by `requireAdmin()`, which needs `aal2`; a password-only session is redirected to `/mfa`. Service-client imports carry an eslint-disable reason.
