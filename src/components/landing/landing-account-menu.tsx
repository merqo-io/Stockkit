'use client';

import { AccountMenu, getSwitchKits } from '@merqo/ui';
import Link from 'next/link';

import { getHelp, onFeedbackSubmit, signOutAction } from '@/components/account-menu-wiring';

interface Props {
  vendorName: string;
  avatarUrl?: string | null;
}

// Client island so the public layout and Nav stay server components. Sign-out
// is the shared server action, identical to the dashboard's.
export function LandingAccountMenu({ vendorName, avatarUrl = null }: Props) {
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
