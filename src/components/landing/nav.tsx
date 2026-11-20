import { LandingAccountNav, LandingNav, type NavUser } from '@merqo/ui';
import Link from 'next/link';

import { signOutAction } from '@/app/actions/auth';
import { submitFeedbackAction } from '@/app/actions/feedback';
import { submitLandingSupportAction } from '@/app/actions/support';
import { Button } from '@/components/ui/button';
import { BrandText } from '@/components/widgets';
import { PAGE_ROUTES, WAITLIST_URL } from '@/lib/constants/routes';
import { SUPPORT_CATEGORY_LABELS } from '@/lib/schemas';

interface NavProps {
  user?: NavUser | null;
}

// Public-marketing nav only — the dashboard uses its own DashboardNav
// (vendor name + sign out), never this one, so this stays a plain server
// component: logo plus one auth-aware primary action, no client JS needed.
// The sticky/z-index/background/padding shape lives in @merqo/ui's
// LandingNav shell (shared across all Merqo kits); this file only supplies
// stockkit's wordmark and right-side content.
export function Nav({ user = null }: NavProps) {
  return (
    <LandingNav
      wordmark={
        // eslint-disable-next-line @next/next/no-html-link-for-pages -- Link leaves the old hash in the URL bar on a fragment-only jump
        <a
          href="/#top"
          className="font-display text-3xl font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          <BrandText />
        </a>
      }
      end={
        <>
          <Button asChild variant="ghost" size="sm" className="hidden rounded-lg sm:inline-flex">
            <Link href="/about">About</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-lg">
            <Link href="/faq">FAQ</Link>
          </Button>
          {user ? (
            <LandingAccountNav
              kit="stockkit"
              dashboardHref={PAGE_ROUTES.DASHBOARD}
              user={user}
              signOutAction={signOutAction}
              actions={{
                submitSupport: submitLandingSupportAction,
                submitFeedback: submitFeedbackAction,
              }}
              supportCategories={SUPPORT_CATEGORY_LABELS}
              LinkComponent={Link}
            />
          ) : (
            <>
              <Button asChild variant="ghost" className="h-10 rounded-lg px-4">
                <Link href={PAGE_ROUTES.LOGIN}>Sign in</Link>
              </Button>
              <Button asChild size="sm" className="font-semibold">
                <a href={WAITLIST_URL}>Join the waitlist</a>
              </Button>
            </>
          )}
        </>
      }
    />
  );
}
