# accept

## Purpose

The legal-acceptance interstitial a signed-in vendor is redirected to when
their accepted terms/privacy versions are behind `@merqo/ui`'s
`LEGAL_VERSIONS`. stockkit owns no acceptance record — merqo does — so this
folder's job is entirely to collect the vendor's consent and forward it.

## Contents

- `page.tsx` — `LegalAcceptPage`. Reads the `next` search param (through
  `safeRedirectPath`, `@merqo/ui`) and renders the client form.
  Deliberately runs no legal-gate check itself — it is what the gate
  redirects to, so gating it would loop.
- `accept-form.tsx` — `AcceptForm`, a client component wrapping `@merqo/ui`'s
  `TermsAcceptanceCheckbox` (just the agree checkbox — no typed name); the
  submit button is disabled until it's checked, with a "Tick the box to
  continue." hint tied to it by `aria-describedby`. Posts to
  `acceptLegalTerms`. A ghost "Sign out" button (browser Supabase client, then
  `/login`) is the only exit, since this page is where the legal gate sends
  the vendor.
- `accept-form.dom.test.tsx` — covers the hint and the sign-out success and
  failure paths.
- `actions.ts` — `acceptLegalTerms` server action. Re-checks for a signed-in
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
