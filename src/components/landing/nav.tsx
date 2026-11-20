import { LandingNav } from '@merqo/ui';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { BrandText } from '@/components/widgets';
import { PAGE_ROUTES, WAITLIST_URL } from '@/lib/constants/routes';
import { LandingAccountMenu } from './landing-account-menu';

interface NavProps {
  authed?: boolean;
  vendor?: { name: string; avatarUrl?: string | null };
}

// Public-marketing nav only — the dashboard uses its own DashboardNav
// (vendor name + sign out), never this one, so this stays a plain server
// component: logo plus one auth-aware primary action, no client JS needed.
// The sticky/z-index/background/padding shape lives in @merqo/ui's
// LandingNav shell (shared across all Merqo kits); this file only supplies
// stockkit's wordmark and right-side content.
export function Nav({ authed = false, vendor }: NavProps) {
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
          {authed ? (
            <>
              <Button asChild variant="ghost" size="sm" className="h-10 rounded-lg px-3">
                <Link href={PAGE_ROUTES.DASHBOARD}>Dashboard</Link>
              </Button>
              <LandingAccountMenu
                vendorName={vendor?.name ?? 'Your stall'}
                avatarUrl={vendor?.avatarUrl}
              />
            </>
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
