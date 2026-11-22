import type { ReactNode } from 'react';

import { Nav } from '@/components/landing/nav';
import { SiteFooter } from '@/components/layout';
import { resolveLandingNavUser } from '@/lib/landing-nav-user';
import { createServerClient } from '@/lib/supabase/server';
import { BackToTop } from '@merqo/ui';

export const revalidate = 0;

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const authed = !!user;

  const navUser = await resolveLandingNavUser(supabase, user, async (id) => {
    const { data } = await supabase.from('vendors').select('name').eq('id', id).maybeSingle();
    return data;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Nav user={navUser} />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter showSignIn={!authed} />
      <BackToTop />
    </div>
  );
}
