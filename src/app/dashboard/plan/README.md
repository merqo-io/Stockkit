# dashboard/plan

## Purpose

The vendor-facing plan page. It shows the vendor's current plan, what it
includes, and (on Free) a "Request Pro" button that files a support message
for a manual upgrade. Merqo owns subscriptions
and pricing, so stockkit stores no price: the page fetches merqo's public
`GET /api/plans` catalog (`fetchPlanCatalog` from `@merqo/ui`, base URL from
`MERQO_BASE_URL`) and renders the shared `PricingLadder`, highlighting
All-Access without Event Pass (it does not cover stockkit). When merqo is
unreachable the page shows the current plan plus a muted "Prices are
unavailable right now" line. Prices appear only here on the vendor dashboard,
never on public pages. The limits shown are display-only; the gates are
enforced by `dashboard/products/actions.ts` and the database.

## Contents

- `page.dom.test.tsx`: covers the ladder, the null-catalog fallback and the
  base-URL resolution with `@merqo/ui` mocked.
- `request-pro-button.tsx`, `RequestProButton` (client): calls
  `submitSupportMessageAction` with the `account` category, toasts the result
  and disables itself once sent. `request-pro-button.dom.test.tsx` covers both
  outcomes.
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

The page sets `metadata.title` "Plan" (rendered through the root `%s | stockkit` template) and relies on the dashboard layout for top padding.

The page heading is `@merqo/ui`'s `PageHeader`.
