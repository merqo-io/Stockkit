import type { ReactNode } from 'react';

import { Nav } from '@/components/landing/nav';
import { SiteFooter } from '@/components/layout';
import { createServerClient } from '@/lib/supabase/server';
import { BackToTop, toNavUser } from '@merqo/ui';

export const revalidate = 0;

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const authed = !!user;

  // A plain read, not resolveVendorName: that helper can create the shared
  // profile row, which public pages must not do on every render.
  const { data: row } = user
    ? await supabase.from('vendors').select('name').eq('id', user.id).maybeSingle()
    : { data: null };
  const navUser = toNavUser(user, row?.name);

  return (
    <div className="flex min-h-screen flex-col">
      <Nav user={navUser} />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter showSignIn={!authed} />
      <BackToTop />
    </div>
  );
}
