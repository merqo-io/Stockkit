import type { ReactNode } from 'react';

import { Nav } from '@/components/landing/nav';
import { SiteFooter } from '@/components/layout';
import { createServerClient } from '@/lib/supabase/server';
import { readVendorStallName } from '@/lib/vendor-stall-name';
import { BackToTop, toNavUser } from '@merqo/ui';

export const revalidate = 0;

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const authed = !!user;

  // Same stall name the dashboard shows, read-only: resolveVendorName can
  // create the shared profile row, which public pages must not do on render.
  const stallName = user ? await readVendorStallName(user.id) : null;
  const navUser = toNavUser(user, stallName);

  return (
    <div className="flex min-h-screen flex-col">
      <Nav user={navUser} />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter showSignIn={!authed} />
      <BackToTop />
    </div>
  );
}
