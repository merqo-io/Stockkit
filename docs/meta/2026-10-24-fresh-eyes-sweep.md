# Fresh-eyes sweep (Phase 8 close-out)

Roadmap items X-14 (knip), X-15 (changelog stamp), X-16 (loading states), X-20 (folder READMEs). Mechanical fixes only; anything needing a product or schema decision is listed under Deferred or Needs owner.

## knip

- Command: `pnpm dlx knip@6.44.2 --no-progress` (same version printkit used). knip is not a dependency.
- `knip.json` ignores `.claude/**` (harness scripts and the harness-base copy are not app code).
- Before: 3 unused files (2 of them under `.claude/`), 1 unused dependency, 2 unused devDependencies, 9 unused exports, 12 unused exported types.
- After: 0 findings, with three dependency ignores kept in `knip.json`:
  - `driver.js`: the tour runs inside `@merqo/ui`'s `DashboardTour`; stockkit pins it so the shared component resolves it. Not imported here.
  - `eslint-plugin-react-hooks`: pulled in by `eslint-config-next`; kept as an explicit pin and not referenced in `eslint.config.mjs`. Removing it needs an owner check of the eslint config chain.
  - `pino-pretty`: loaded by name as a pino transport target in `src/lib/logger.ts`, which static analysis cannot see.
- Removed: `src/components/ui/separator.tsx`; `CommandDialog`, `CommandSeparator`, `CommandShortcut`, `PopoverAnchor`, `PopoverHeader`, `PopoverTitle`, `PopoverDescription`; types `Vendor`, `Feedback`, `Admin`, `AdminAudit`, `EntitlementPayload`, `PasswordChangeInput`, `DisplayNameInput`, `VendorInput`.
- Un-exported (used only in their own file): `buttonVariants`, `tabsListVariants`, `VendorActivityMetric`, `MetricsPayload`, `PlanFeature`, `LegalCheckState`.

## Duplicates

- Fixed: `merqoBaseUrl()` was defined in both `src/app/dashboard/plan/page.tsx` and `src/app/legal/accept/actions.ts`; now `src/lib/merqo-base-url.ts` with a test.
- Not duplicates: the two `submitLabel` helpers (login form, product form, stock form) have different inputs and copy.
- Cross-kit candidates only (nothing extracted): `clientIp` and the rate-limit wrapper in `src/lib/rate-limit.ts` (already thin over `@merqo/ui/kit-api`; a stockkit-local `clientIp` remains), `merqoBaseUrl()` (likely in every kit that calls merqo), the bearer check in `src/lib/merqo-auth.ts`, and `listAllUsers` use in the vendor-status and vendor-activity routes.

## Server vs client components

- `"use client"` files that could be server components: none confirmed. `src/app/admin/vendors/vendors-table.tsx` and `src/app/admin/activity/activity-log.tsx` are thin wrappers over `@merqo/ui` pieces (`DataTable`, `AuditLogTable`), which are all client components. `vendors-table.tsx` passes column render functions, so it must be a client file. `activity-log.tsx` passes data only; it may be convertible, but verify in the browser first. Deferred.

## Sequential awaits

- `src/app/dashboard/products/page.tsx:28-29`: `await searchParams` and `readVendorTier` are independent and could be one `Promise.all`; the gain is one cheap round trip. Deferred.
- `src/app/mfa/page.tsx:13-15`: `listFactors` runs after the aal2 check and is only needed when not aal2; parallelising would waste a call for the redirect case. Left as is.
- Admin pages already use `Promise.all` for their queries. Other sequential awaits are data-dependent (user id before queries).

## loading.tsx

- Added `src/app/admin/loading.tsx` (covers overview, vendors, activity; one outline serves all three) and `src/app/mfa/loading.tsx`, each with a `loading.dom.test.tsx`. The dashboard one already existed.
- `src/app/(public)/page.tsx`: not needed. It is a static-feeling marketing page whose only await is `supabase.auth.getUser()` (a cookie read plus a quick auth call); a skeleton would flash and then replace identical-looking content.
- `src/app/legal/accept/page.tsx` awaits only `searchParams`: not a gap.
- Not fixable with a segment `loading.tsx`: layouts that await data run before their own segment's boundary, so the skeleton does not cover them. `src/app/dashboard/layout.tsx:13-45`, `src/app/admin/layout.tsx:11-13`, `src/app/(public)/layout.tsx:10-14`. Covering them needs a boundary in a parent segment or a Suspense inside the layout. Deferred.

## Bundle size

`pnpm build` on this Next version prints the route table only, with no First Load JS column, so there are no size figures here. `.next` was not inspected.

## Coverage

`pnpm test:ci` (vitest with v8 coverage): 94 test files and 602 tests on the base, all passing; overall 94.14% lines. Business-logic files under 70% lines: `src/lib/legal-gate.ts` (33%, thin wrapper over `@merqo/ui/auth`; its test covers env wiring only). `src/lib/supabase/env.ts` is 0% (env reads). Everything else under 70% is pages, layouts and icon routes (`src/app/(public)/*`, `(auth)/page.tsx`, `icon.tsx`, `apple-icon.tsx`).

## templateCentral standards

The `templatecentral:standards` skill is not available to this builder, so code-standards, validation-patterns and drift-check were not run. Supabase-vs-templateCentral data-layer drift is expected (see `templatecentral-adoption-log.md`).

## Fixed in this PR

- Dead code listed under knip, plus `knip.json`.
- Duplicate `merqoBaseUrl()` extracted.
- Loading skeletons for `/admin` and `/mfa`, folder READMEs for `src/app/api` and `src/app/api/health`.
- CHANGELOG stamped as `0.5.0 - 2026-11-10` with an empty `[Unreleased]`; `package.json` version 0.5.0. The identical "Products page" bullet that appeared three times in the old unreleased block was kept once.

## Deferred

- Convert `activity-log.tsx` to a server component if `AuditLogTable` accepts it.
- `Promise.all` for `searchParams` and tier in the products page.
- Boundaries for data-awaiting layouts (listed above).
- Explicit return types on exported functions: no lint rule enforces them and several are inferred JSX; needs a policy decision.
- Raise `legal-gate.ts` coverage only if more logic is added to it.

## Needs owner

- Whether to keep the `driver.js` and `eslint-plugin-react-hooks` pins.
- Cross-kit extraction of `merqoBaseUrl`, bearer check and `clientIp` into `@merqo/ui`.
- The "staging deploys through its deploy hook" line in the 0.5.0 Changed section contradicts the git-integration line; both are historical and left as written.
