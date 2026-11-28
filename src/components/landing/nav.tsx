import { LandingAccountNav, LandingNav, type NavUser } from '@merqo/ui';
import Link from 'next/link';

import { signOutAction } from '@/app/actions/auth';
import { submitFeedbackAction } from '@/app/actions/feedback';
import { submitLandingSupportAction } from '@/app/actions/support';
import { BrandText } from '@/components/widgets';
import { PAGE_ROUTES, WAITLIST_URL } from '@/lib/constants/routes';
import { SUPPORT_CATEGORY_LABELS } from '@/lib/schemas';
import { Button } from '@merqo/ui/primitives';

interface NavProps {
  user?: NavUser | null;
}

// Server component: the shell shape lives in @merqo/ui's LandingNav, and the
// signed-in end is the shared LandingAccountNav client island. The dashboard
// uses its own DashboardNav.
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
      links={[
        { label: 'About', href: '/about' },
        { label: 'FAQ', href: '/faq' },
      ]}
      end={
        <>
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
            />
          ) : (
            <>
              <Button asChild variant="ghost" className="min-h-11 rounded-lg px-4">
                <Link href={PAGE_ROUTES.LOGIN}>Sign in</Link>
              </Button>
              <Button asChild size="sm" className="min-h-11 font-semibold">
                <a href={WAITLIST_URL}>Join the waitlist</a>
              </Button>
            </>
          )}
        </>
      }
    />
  );
}
