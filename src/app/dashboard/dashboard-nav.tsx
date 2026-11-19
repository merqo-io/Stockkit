'use client';

import { DashboardNav as SharedDashboardNav, getSwitchKits } from '@merqo/ui';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { getHelp, onFeedbackSubmit } from '@/components/account-menu-wiring';
import { BrandText } from '@/components/widgets';
import { navigatingAway } from '@/hooks';
import { PAGE_ROUTES } from '@/lib/constants/routes';
import { createClient } from '@/lib/supabase/client';

interface Props {
  vendorName: string;
  avatarUrl?: string | null;
}

const NAV_LINKS = [
  { href: PAGE_ROUTES.DASHBOARD, label: 'Overview' },
  { href: PAGE_ROUTES.PRODUCTS, label: 'Products' },
];

function isActive(path: string, href: string): boolean {
  return href === PAGE_ROUTES.DASHBOARD ? path === PAGE_ROUTES.DASHBOARD : path.startsWith(href);
}

/** Stable anchor id for the onboarding tour, e.g. "/dashboard/products" → "nav-products". */
function tourAnchor(href: string): string {
  return `nav-${href === PAGE_ROUTES.DASHBOARD ? 'overview' : href.split('/').pop()}`;
}

const WORDMARK = (
  <Link
    href={PAGE_ROUTES.DASHBOARD}
    className="font-display shrink-0 text-3xl font-semibold tracking-tight transition-opacity hover:opacity-80"
  >
    <BrandText />
  </Link>
);

/**
 * Dashboard nav content — thin adapter composing `@merqo/ui`'s `DashboardNav`
 * (which renders its own sticky `<header>`; the wrapping element in
 * `layout.tsx` must stay `display: contents` so that header's `position:
 * sticky` isn't broken by a nested containing block) with stockkit-specific
 * wiring: sign-out, plus the shared Feedback/Get-help throw-adapters from
 * `@/components/account-menu-wiring`.
 */
export function DashboardNav({ vendorName, avatarUrl = null }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  async function signOutAction() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    router.push('/login');
    router.refresh();
    await navigatingAway();
  }

  return (
    <SharedDashboardNav
      wordmark={WORDMARK}
      navLinks={NAV_LINKS}
      isActiveHref={(href) => isActive(pathname, href)}
      tourAnchor={tourAnchor}
      vendor={{ name: vendorName, avatarUrl: avatarUrl ?? undefined }}
      signOutAction={signOutAction}
      switchKits={getSwitchKits('stockkit')}
      getHelp={getHelp}
      onFeedbackSubmit={onFeedbackSubmit}
      showNps
    />
  );
}
