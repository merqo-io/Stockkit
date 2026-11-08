# src/app/(auth)/login

Combined sign-in/sign-up page. `page.tsx` is a thin `Suspense` wrapper;
`login-form.tsx` holds the actual client component (email/password,
`SentNotice` for the check-your-email screen, Google OAuth — forces `hl=en` on the consent screen, cross-kit parity —
forgot-password). `actions.ts` has `completeSignup`, the
server action that creates the `vendors` row after a new signup.
`GoogleMark` comes from `@merqo/ui`, shared by the kit login pages.

Every async handler in `login-form.tsx` (Google sign-in, sign-in/up,
password-reset send) wraps its Supabase call in `try/catch` — a thrown
rejection (e.g. a raw network failure, not a returned `{ error }`) still
shows a generic toast instead of failing silently.

`login-form.dom.test.tsx` relies on `test/setup.ts`'s global RTL
`cleanup()` rather than its own per-file `afterEach`.

Both the sign-in/sign-up card and the collapsed forgot-password panel are
wrapped in `@merqo/ui`'s `ElevatedCard` (2026-09-16, was stockkit-local).

`completeSignup` is rate limited (5 per hour per user, 20 per hour per IP) and fails closed (the IP bucket is skipped when no client IP is known), answering with "Too many tries. Please wait and try again."

Auth errors never reach the UI raw: every returned Supabase error goes through `authErrorMessage` (`@/lib/auth-error-message`) with an action-specific fallback. The vendor's business is labelled "Business name" in the UI; the local state and DB column keep their existing names.

Login copy keeps real UTF-8 characters (ellipsis, em dash, password bullets).

UI primitives (badge, card, dialog, input, label, select, switch, textarea) and `cn` used here come from `@merqo/ui/primitives`, not local copies.
