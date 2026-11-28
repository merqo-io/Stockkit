# src/components/landing

`nav.tsx` (`Nav`) is the public landing nav, wired in by
`src/app/(public)/layout.tsx` (not composed as a page section here). It's
a thin content wrapper over `@merqo/ui`'s `LandingNav` shell — that shared
component owns the sticky/z-index/background/padding shape (fixed a
structural drift vs. qkit/loopkit/paykit/merqo's near-identical landing
navs: `z-50`→`z-20`, `bg-background/80`→`/85`, padding moved from the
inner `<nav>` onto the `<header>`); `Nav` only supplies the two-tone
`StockKit` wordmark (`LandingNav`'s `wordmark` prop), About and FAQ (`/faq`) as plain-data `links` (inline from `sm`, a burger menu below it), and auth-aware CTA buttons (`end` prop). No theme toggle here — that's a
signed-in preference, and lives in `@merqo/ui`'s `AccountMenu` (v0.18.0+)
instead. Matches every other kit's
`src/components/landing/nav.tsx` file/export naming — this used to live at
`src/components/layout/navbar.tsx` exporting `Navbar`, the one structural
outlier across the Merqo kit family, before this migration.

`Nav` is a Server Component, so it must not pass `next/link` (a plain function there) as `LinkComponent` to the client `LandingAccountNav`; the shared nav falls back to `<a>`. `nav.server-boundary.dom.test.tsx` guards this.

The landing page is `Hero`, `HowItWorks` (client, a three-step `Journey`), `Faq` (three `FaqRows`) and `Closing` (`ClosingCall`), composed by `src/app/(public)/page.tsx`. `Hero` takes an `authed` prop and routes an already-signed-in vendor straight to `/dashboard`. The pieces come from `@merqo/ui` (`Journey`, `JourneyStep`, `PhoneFrame`, `PressButton`, `FaqRows`, `ClosingCall`, `useScrollPlay`) in the same shape as loopkit and paykit.

`Hero`'s `<h1>` ("See what your stock is worth, and what is running low.") claims only what the overview does: it adds up `on_hand x unit_cost` and counts products at or under their low-stock threshold. There is no per-product cost tracking, so the page must not claim it. The `stockkit` name is a small mono kicker above it.

The phone mock-ups (`stock-screen.tsx`) only use strings the signed-in app renders; `stock-labels.ts` lists each one with its source file. Change a label in the app and change it there. Step 1 (add a product) and step 3 (overview) are scroll-played and rewind on the way up; step 2 (restock) is the visitor's to press, and scrolling never presses it. Under reduced motion every step shows its finished state, and step 2 gets a Replay button. The sample product ("Oat milk") is illustrative, not a vendor's data. The hero phone is static: nothing moves there because no product event is behind it.

Every real control on the landing is at least 44px tall (`min-h-11`) at 390px: the nav Sign in and waitlist buttons, the hero and closing CTAs, and the interactive restock button. Decorative `aria-hidden` mock buttons are exempt. Set it at the call site; the shared `Button` variants stay untouched.

Landing surfaces carry no shadow, no hover lift and no entrance animation, per the shared public-page rules (see root `DESIGN.md`).

Every `.dom.test.tsx` file here relies on `test/setup.ts`'s global RTL
`cleanup()` instead of declaring its own per-file `afterEach`.

`BackToTop` comes from `@merqo/ui` and is rendered beside `SiteFooter` in the public layout.

`landing-copy.dom.test.tsx` renders the real `Nav`, `Hero`, `HowItWorks`, `Faq` and `Closing` together and guards the public copy: no `$` outside the phone mock-ups, no em dash or banned words, the "In build" badge, the exact pilot pricing line, and every signup CTA pointing at `WAITLIST_URL`. Signed-out CTAs read "Join the waitlist"; `/login` and `/dashboard` stay reachable by direct URL and the nav "Sign in" link. `Hero` shows an "In build" badge with "Built, not yet tried with vendors."; the low-stock step says the overview lists what is running low and that it sends no alerts.

UI primitives (badge, card, dialog, input, label, select, switch, textarea) and `cn` used here come from `@merqo/ui/primitives`, not local copies.

`Nav` also takes `user` (a `NavUser` from `toNavUser`, built by `(public)/layout.tsx`; `null` signed out). Signed in, `end` shows `@merqo/ui`'s `LandingAccountNav` (Dashboard link plus the account menu, wired to stockkit's sign-out, feedback and `submitLandingSupportAction` server actions); signed out it is unchanged. A missing name falls back to "Account".

Buttons here come from `@merqo/ui/primitives` (the shared `Button`), not a local copy.
