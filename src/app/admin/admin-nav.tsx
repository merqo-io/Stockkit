'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { PAGE_ROUTES } from '@/lib/constants/routes';
import { cn } from '@merqo/ui/primitives';

const TABS = [
  { href: PAGE_ROUTES.ADMIN, label: 'Overview' },
  { href: PAGE_ROUTES.ADMIN_VENDORS, label: 'Vendors' },
  { href: PAGE_ROUTES.ADMIN_ACTIVITY, label: 'Activity' },
];

/** Back link plus admin section tabs. Overview matches exactly; Vendors matches by prefix. */
export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="mx-auto flex max-w-5xl items-center gap-1 px-5 pt-3 pb-1">
      <Link
        href={PAGE_ROUTES.DASHBOARD}
        className="text-muted-foreground hover:bg-muted mr-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>
      {TABS.map((t) => {
        const active =
          t.href === PAGE_ROUTES.ADMIN ? path === PAGE_ROUTES.ADMIN : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors',
              active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
