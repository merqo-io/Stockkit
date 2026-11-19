'use client';

import { DashboardNav as SharedDashboardNav, getSwitchKits } from '@merqo/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { getHelp, onFeedbackSubmit, signOutAction } from '@/components/account-menu-wiring';
import { BrandText } from '@/components/widgets';
import { PAGE_ROUTES } from '@/lib/constants/routes';

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
 * wiring: the shared sign-out action plus the shared Feedback/Get-help throw-adapters from
 * `@/components/account-menu-wiring`.
 */
export function DashboardNav({ vendorName, avatarUrl = null }: Props) {
  const pathname = usePathname();

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
