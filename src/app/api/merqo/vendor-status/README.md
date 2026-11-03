# vendor-status

## Purpose

`GET /api/merqo/vendor-status?email=…` — merqo hub's lookup of whether a
vendor has a stockkit `vendors` row and, if so, their plan (`free`/`pro`).
Bearer-secret gated (`bearerOk`, `MERQO_METRICS_SECRET`) — merqo hub is the
only caller.

## Contents

- `route.ts` — resolves the email to an auth user via `listAllUsers`
  (paginated, `src/lib/list-all-users.ts`), reads `vendors` for that user's
  row and the plan from the `vendor_entitlements` cache, and returns `{ active, plan }` via `resolveVendorStatus`
  (`src/lib/merqo-vendor-status.ts`).
- `route.test.ts` — auth/validation/upstream-failure cases for the route above.

## Parent

See the repo root [README.md](../../../../../README.md) for the full layout.

## Boundary and coverage

Validate the email and reject failed or incomplete administrator listings before resolving vendor status. Tests cover authorization, malformed input and upstream failures so an unavailable lookup cannot be mistaken for a vendor who has never activated the product.

The route is gated by `guardMerqoRoute` (`src/lib/merqo-auth.ts`): 120 requests per minute per route and IP (429 with Retry-After, fails open on limiter error), then the bearer check; a 401 logs route, reason and IP, never the token.
