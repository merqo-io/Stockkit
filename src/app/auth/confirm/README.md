# src/app/auth/confirm

Landing step for emailed auth links (recovery, signup, invite, magic link, email change) that carry a `token_hash`.

- `page.tsx`: GET page. Reads `token_hash`, `type` and `next` with `readAuthConfirmParams` and renders `AuthConfirmForm` (or `AuthConfirmInvalid`). It never calls Supabase, so an email scanner pre-fetching the link cannot consume the token. `noindex` and `referrer: no-referrer` keep the token out of indexes and Referer headers.
- `page.dom.test.tsx`: covers the valid, invalid and metadata cases.
- `verify/route.ts`: POST only. `handleAuthConfirm` verifies the token, then runs `ensureVendorRow` like `/auth/callback`, sends `recovery` to `/reset-password` and everything else to `next` (default `/dashboard`). Any failure goes to `/login?error=link`.
- `verify/route.test.ts`: covers the landing paths, failure, the vendor-row step and a cross-origin POST.
