# entitlement

## Purpose

`POST /api/merqo/entitlement`: merqo owns subscriptions and pushes each
vendor's entitlement to every kit. This route stores it in
`stockkit.vendor_entitlements`, which the plan gate reads instead of any local
plan column.

## Contents

- `route.ts` — runs `guardMerqoRoute` (120 requests per minute per route and
  IP, then the `MERQO_PROVISION_SECRET` bearer check) before parsing, validates
  the body with `entitlementPayloadSchema` (`src/lib/merqo-entitlement-contract.ts`),
  rejects a `kit` other than `stockkit` with 400, then calls
  `apply_vendor_entitlement` (migration `0025`). That function maps the email
  to the auth user and upserts only when `issued_at` is newer, so a stale or
  replayed push is a 200 no-op. An unknown email is 404 `unknown_vendor`.
- `route.test.ts` — 401, 400 (body, tier, kit), 404, 200 stored, 200 stale,
  500 and the `valid_until` lapse cases.

## Parent

See [api/merqo](../README.md).
