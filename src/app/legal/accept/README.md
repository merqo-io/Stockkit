# accept

## Purpose

The legal-acceptance interstitial a signed-in vendor is redirected to when
their accepted terms/privacy versions are behind `@merqo/ui`'s
`LEGAL_VERSIONS`. stockkit owns no acceptance record — merqo does — so this
folder's job is entirely to collect the vendor's consent and forward it.

## Contents

- `page.tsx` — `LegalAcceptPage`. Reads the `next` search param (through
  `safeRedirectPath`, `@merqo/ui`, default `/dashboard`) and renders
  `@merqo/ui`'s `AuthShell` around its `AcceptTermsForm` (agree checkbox,
  submit disabled until ticked, posts to `acceptLegalTerms`). A "Sign out"
  form in the shell footer posts to `signOutAction` (`@/app/actions/auth`),
  the only exit for a vendor who declines; `AcceptTermsPage` is not used
  because it has no slot for it. Deliberately runs no legal-gate check
  itself — it is what the gate redirects to, so gating it would loop.
- `page.dom.test.tsx` — covers the touch-gated submit, `next` sanitising and
  the sign-out exit.
- `actions.ts` — `acceptLegalTerms` server action (posts through `createMerqoClient`, hashes with `digest` and reads the base URL with `merqoBaseUrl`, all from `@merqo/ui/kit-api`). Re-checks for a signed-in
  user (redirects to `/login` otherwise), reads the vendor's real
  `ip`/`user_agent`, then `POST`s `/api/merqo/legal-accept` on merqo once
  per doc type (`terms`, `privacy`), each independent so a
  duplicate-acceptance conflict on one never blocks the other. The
  recorded `doc_sha256` hashes `getLegalDocSource(docType, "stockkit")` —
  the same kit-scoped content `terms/page.tsx` actually renders, not the
  full multi-kit annex. On success it primes the local `legal_check_state`
  cache and redirects to a `safeRedirectPath`-checked `next` (default
  `/dashboard`).
- `actions.test.ts` — covers the two independent posts, the cache prime,
  `next`-param safety, the no-user/missing-secret branches, and a non-2xx
  throw.

## Parent

[legal](../README.md)

The `next` form field is length-checked by Zod before `safeRedirectPath` runs.

The request IP recorded for the acceptance comes from `clientIp` in `src/lib/rate-limit.ts` (`x-vercel-forwarded-for`, then `x-real-ip`, then the last `x-forwarded-for` hop, never the first).

The page heading is `@merqo/ui`'s `PageHeader`.

`MERQO_BASE_URL` must be the canonical host: the shared client sets `redirect: "error"`, so a host that redirects (for example apex to www) fails the acceptance. In development (`NODE_ENV` not `production`) an `http://localhost` base URL is allowed.
