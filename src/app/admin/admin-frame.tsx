'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { BrandText } from '@/components/widgets';
import { PAGE_ROUTES } from '@/lib/constants/routes';
import { AdminShell } from '@merqo/ui';

const TABS = [
  { href: PAGE_ROUTES.ADMIN, label: 'Overview' },
  { href: PAGE_ROUTES.ADMIN_VENDORS, label: 'Vendors' },
  { href: PAGE_ROUTES.ADMIN_ACTIVITY, label: 'Activity' },
];

/** Client wrapper around the shared AdminShell: the shell needs the current
 * path for its active tab, and the server layout cannot call usePathname. */
export function AdminFrame({ actions, children }: { actions: ReactNode; children: ReactNode }) {
  return (
    <AdminShell
      wordmark={<BrandText />}
      tabs={TABS}
      pathname={usePathname()}
      backHref={PAGE_ROUTES.DASHBOARD}
      backLabel="Back to dashboard"
      LinkComponent={Link}
      actions={actions}
    >
      {children}
    </AdminShell>
  );
}
