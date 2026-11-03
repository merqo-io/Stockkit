# dashboard/plan

## Purpose

The vendor-facing plan page. It shows the vendor's current plan, what it
includes, and "Change plan from your Merqo account". Merqo owns subscriptions
and pricing, so the page shows no price. It only displays limits; the gates are
enforced by `dashboard/products/actions.ts` and the database.

## Contents

- `page.tsx`, `PlanPage()` (server, `revalidate = 0`): auth guard, reads the
  vendor's tier from the merqo entitlement cache via `readVendorTier`
  (`@/lib/vendor-entitlement`, failing closed to Free), and hands it to
  `@/lib/plan`'s `resolvePlanView`, which owns the free-vs-pro branching so it
  is unit-testable. The page maps the returned `PlanFeature[]`, wrapping every
  `metric` number in `font-mono`. The "back to Dashboard" nav uses `@merqo/ui`'s
  `BackButton` without a `LinkComponent` override: this is a Server Component,
  and passing `next/link` as a prop would send a function across the Server to
  Client boundary.

## Connectivity

Routed at `PAGE_ROUTES.PLAN` (`/dashboard/plan`) and reachable from
`dashboard-nav.tsx`'s account menu ("Plan"). The cache it reads is filled by
`POST /api/merqo/entitlement` (`src/app/api/merqo/entitlement`).

## Parent

[dashboard](../README.md)
