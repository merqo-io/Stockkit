# dashboard/profile

## Purpose

Vendor account profile page — business name, social links, profile icon,
display name, and sign-in password, each saved independently through the
channel that owns that data (shared `merqo.vendor_profile` for stall
name/social links vs. the Supabase auth user for icon/display
name/password), per
`docs/business/2026-07-21-profile-settings-page-standard.md`.

## Contents

- `actions.ts` — `updateStallName(input)` and `updateSocialLinks(input)`
  server actions; both go through the shared `merqo.vendor_profile` RPC
  wrappers in `@/lib/merqo-vendor-profile`. Display name, avatar, and
  password are explicitly **not** handled here — they live on the auth
  user and are set client-side via `supabase.auth.updateUser`.
- `page.tsx` — `ProfilePage()` (server, `revalidate = 0`): auth guard,
  overlays the shared vendor profile onto the local `vendors` row (§3.3 of
  the standard), reads `display_name`/`avatar_url` defensively off
  `user.user_metadata`, and renders `ProfileForm`. The "back to Dashboard"
  nav uses the shared `@merqo/ui`'s `BackButton`, not a
  plain text link — and deliberately without a `LinkComponent` override,
  since passing `next/link` in from a Server Component sends a function
  across the Server → Client boundary, which Next rejects at render.
- `profile-form.tsx` — `ProfileForm({ vendorId, stallName, socialLinks,
displayName, email, avatarUrl })`, client component, five independently
  saved `@/components/section.tsx` `Section`s laid out via `@merqo/ui`'s
  `TwoColumnSections` (two independent `flex flex-col` stacks, never a CSS
  grid — see the standard's §2.3). Column 1: business name, profile icon
  (`@merqo/ui`'s `ImageUploader`, backed by `@/lib/image-upload-adapter.ts`'s
  `uploadVendorAvatar`), change password. Column 2: display name, social
  links (`@merqo/ui`'s `SocialLinksFields` — real brand icons per
  field, not plain unlabeled inputs). Column order and layout mechanism
  match the standard exactly. The business-name and avatar saves call
  `router.refresh()` on success so `dashboard-nav.tsx` — which renders
  both, once, in the persistent dashboard layout — picks up the change
  immediately instead of showing stale data until a hard reload.

## Connectivity

Reachable from `dashboard-nav.tsx`'s account menu ("Profile" item).
`page.tsx` calls `createServerClient()` + `getOrCreateVendorProfile`,
renders `profile-form.tsx`, which calls `actions.ts`'s
`updateStallName`/`updateSocialLinks` for stall name/social links and the
browser Supabase client (`@/lib/supabase/client`) directly for
avatar/display-name/password, all validated against schemas in
`@/lib/schemas`. Avatar uploads go through `@merqo/ui`'s `ImageUploader`
(resize via `@merqo/ui`'s `resizeToWebp`, upload via `@/lib/image-upload-adapter.ts`'s
`uploadVendorAvatar`) to the `vendor-avatars` Storage bucket
(`supabase/migrations/0006_vendor_avatars_bucket.sql`).

`profile-form.dom.test.tsx` relies on `test/setup.ts`'s global RTL
`cleanup()` rather than its own per-file `afterEach`.

## Replaced-avatar cleanup

The avatar save handler deletes the image it orphans: after a successful save, the previous avatar (including on Remove); after a failed save, the fresh upload, which is then referenced nowhere. On a failed save it also restores the previous avatar in state rather than keep showing an image that was never saved.

## Parent

[dashboard](../README.md)

Shared name and social-link writes use field-specific patch_vendor_profile updates, preserving the other column under concurrent saves. Missing rows are provisioned atomically; empty social links explicitly clear links.

Controlled password fields share markup with the recovery form while this page retains its vendor-session save flow. The shared back button uses Next.js `Link`.

`updateStallName` and `updateSocialLinks` share a 10 per hour per user rate limit and fail closed. Avatar uploads go straight to Storage; the `vendor-avatars` bucket caps (5 MB, jpeg/png/webp) are the server-side enforcement.

The page uses `@merqo/ui`'s `PageHeader` (eyebrow "Your account", display-font h1) with no nested `<main>` or extra gutter, since the dashboard layout owns page padding. Sections are flat bordered cards. Only "Save name" is a filled button; the other saves are outline. Failure toasts name the action (for example "Could not save business name. Try again.").

UI primitives (badge, card, dialog, input, label, select, switch, textarea) and `cn` used here come from `@merqo/ui/primitives`, not local copies. The actions return `ActionResult` from `@merqo/ui/kit-api`.

Label and error classes (`FORM_LABEL_CLASS`, `FORM_ERROR_CLASS`) come from `@merqo/ui`.
