# src/app/(auth)/reset-password

Sets a new password on the recovery session `/auth/callback` establishes
after a vendor clicks a password-reset email link. Three states: checking
the session, no session (link expired/used), ready (new-password form).

The page wraps `@merqo/ui`'s `ResetPasswordForm` (validation, 44px controls, expired and failed states) in an `ElevatedCard`; this file keeps only the recovery-session check and the `updateUser` call. Update errors, including a thrown rejection, show inline through the shared form.

`reset-password-form.dom.test.tsx` relies on `test/setup.ts`'s global RTL
`cleanup()` rather than its own per-file `afterEach`.

Each of the three states is wrapped in `@merqo/ui`'s `ElevatedCard`
(2026-09-16, was stockkit-local).

Session lookup failures show a retry state distinct from an expired or missing
session. Both returned errors and rejected requests are covered by regressions.

The policy is stated once, in the shared `PasswordRequirementsHint` beside the label, and a weak-password rejection names the failed rule inline. Update failures are mapped through `authErrorMessage` rather than showing Supabase's raw text.

Reset-password copy keeps real UTF-8 characters (ellipsis).

Buttons here come from `@merqo/ui/primitives` (the shared `Button`), not a local copy.

Tests cover the inline `role="alert"` submit error and the submit button staying pending after success until navigation lands (`navigatingAway`).
