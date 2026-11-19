'use client';

import { AccountMenu, getSwitchKits } from '@merqo/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { getHelp, onFeedbackSubmit } from '@/components/account-menu-wiring';
import { navigatingAway } from '@/hooks';
import { createClient } from '@/lib/supabase/client';

interface Props {
  vendorName: string;
  avatarUrl?: string | null;
}

// Client island so the public layout and Nav stay server components. Sign-out
// mirrors the dashboard's (client-side Supabase signOut, then /login).
export function LandingAccountMenu({ vendorName, avatarUrl = null }: Props) {
  const router = useRouter();

  async function signOutAction() {
    const { error } = await createClient().auth.signOut();
    if (error) throw new Error(error.message);
    router.push('/login');
    router.refresh();
    await navigatingAway();
  }

  return (
    <AccountMenu
      vendor={{ name: vendorName, avatarUrl: avatarUrl ?? undefined }}
      signOutAction={signOutAction}
      switchKits={getSwitchKits('stockkit')}
      getHelp={getHelp}
      onFeedbackSubmit={onFeedbackSubmit}
      showNps
      LinkComponent={Link}
    />
  );
}
