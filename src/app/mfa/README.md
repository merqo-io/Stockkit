# mfa

## Purpose

Second-step sign-in for the stockkit admins. `requireAdmin()` redirects any team
session below `aal2` here, so the operator console is never reachable with a
password alone.

## Contents

- `page.tsx` — server page; `requireTeamMember()` only (it lives outside
  `/admin` so the `aal2` gate cannot loop back), forwards an `aal2` session to
  `/admin`, otherwise passes the verified TOTP factor (or stale unverified ones)
  to the form.
- `loading.tsx` — card skeleton (`role="status"`) shown while the page's admin and factor lookups run; `loading.dom.test.tsx` covers it.
- `mfa-form.tsx` — thin adapter over `MfaForm` from `@merqo/ui`: wires Supabase
  enrol (QR plus manual key) and `challengeAndVerify`, then enters `/admin`.
- `mfa-form.dom.test.tsx` — verify, wrong code, rate limit, enrol failure, enrol-then-verify, touch, bad input.

## Connectivity

Needs TOTP enrolment and verification enabled in Supabase Auth.

A failed verify is mapped through `authErrorMessage`, falling back to "That code didn't work. Enter the latest code from your app."

UI primitives (badge, card, dialog, input, label, select, switch, textarea) and `cn` used here come from `@merqo/ui/primitives`, not local copies.
