# src/app/auth/confirm/verify

POST-only Route Handler the `/auth/confirm` button submits to.

## Contents

- `route.ts`: `POST` wraps `handleAuthConfirm` from `@merqo/ui/auth`. Verifies the `token_hash`, runs `ensureVendorRow` after a successful verification (as `/auth/callback` does), sends a `recovery` token to `/reset-password` and everything else to `next` (default `/dashboard`). Any failure, including a cross-origin POST, redirects to `/login?error=link`. There is no `GET`.
- `route.test.ts`: covers the landing paths, failure, the vendor-row step running only after success, and a cross-origin POST.
