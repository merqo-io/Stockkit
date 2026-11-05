# vendors

## Purpose

Admin vendors console — every vendor with their triage status, plan,
product count, and a per-row Free/Pro toggle, sorted most-urgent first.

## Contents

- `page.tsx` — `AdminVendorsPage`: a Server Component that `requireAdmin()`-gates, fetches `listVendors()` (already sorted by triage urgency), and passes the rows to `VendorsTable` inside a flat bordered panel, under a `PageHeader`.
- `vendors-table.tsx`, `VendorsTable` (`'use client'`): renders the vendor rows via `@merqo/ui`'s shared `DataTable` ("No vendors yet." empty state), owning the `columns` cell renderers (status badge, plan badge) and the `getRowKey` callback, function props can't cross the RSC boundary from `page.tsx`.
- `vendor-status-badge.tsx` — `VendorStatusBadge`: renders `src/lib/vendor-health.ts`'s `VendorStatus` via `@merqo/ui`'s shared `StatusBadge`, one stockkit brand token per status (`destructive`/`primary`/`muted`/`secondary`/`accent` for `attention`/`stuck`/`quiet`/`new`/`healthy`).

## Parent

[admin](../README.md)
