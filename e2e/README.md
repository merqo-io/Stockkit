# e2e

## Purpose

Playwright end-to-end smoke tests. They need only `pnpm dev` and
`playwright install`, with dummy Supabase values and no live database.

## Contents

- `smoke.spec.ts` — public smoke: the landing page renders its "Track stock
  in and out" hero heading, and `/login` renders its "Continue with Google"
  button.
- `auth-guard.spec.ts` — signed-out route protection: `/dashboard`,
  `/dashboard/products` and `/admin` redirect to `/login`. `src/proxy.ts`
  resolves `user: null` locally when there is no session cookie, so the
  redirect fires without a database.

## Connectivity

Run by `pnpm test:e2e` (`playwright.config.ts`, which starts `pnpm dev`) and
by the `e2e (public smoke)` job in `.github/workflows/ci.yml`. Vitest does
not pick these files up: its `include` covers `test/` and `src/` only.

## Parent

[stockkit](../README.md)

- `csp.spec.ts`: in CI (production build) `/login` serves a nonce CSP with nonced scripts and no violations, and `/` keeps the static policy.
- `signed-in-smoke.spec.ts`: signed in as an admin vendor with MFA cleared (`aal2`), `renderSmoke` over every dashboard and admin page, failing on a 5xx, error boundary, page error, CSP violation or 404; a password-only (`aal1`) admin session is sent to `/mfa`. It starts the stand-in below itself and runs in its own Playwright project after the others. It sees empty data, not seeded rows.
- `mock-supabase.ts`: not a spec; a small `http` server standing in for GoTrue and PostgREST, plus `signedInCookie()`, which builds the Supabase auth cookie for a signed-in session.
