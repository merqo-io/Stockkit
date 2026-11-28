'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { navigatingAway } from '@/hooks';
import { PAGE_ROUTES } from '@/lib/constants/routes';
import { createClient } from '@/lib/supabase/client';
import {
  authErrorMessage,
  ElevatedCard,
  PasswordRequirementsHint,
  ResetPasswordForm as SharedResetPasswordForm,
} from '@merqo/ui';

type SessionState = 'checking' | 'ready' | 'no-session' | 'failed';

// Sets a new password on the recovery session established by /auth/callback
// (the reset link exchanges its code there, then forwards here). If no
// session is present the link was already used or expired, so this routes
// the vendor back to sign in rather than showing a form that would fail.
export function ResetPasswordForm() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<SessionState>('checking');

  useEffect(() => {
    let active = true;
    supabase.auth
      .getUser()
      .then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) {
          setState('failed');
          return;
        }
        setState(data.user ? 'ready' : 'no-session');
      })
      .catch(() => {
        if (active) setState('failed');
      });
    return () => {
      active = false;
    };
  }, [supabase, retryKey]);

  return (
    <ElevatedCard className="px-7 py-8">
      <SharedResetPasswordForm
        state={state === 'no-session' ? 'expired' : state}
        onRetry={() => {
          setState('checking');
          setRetryKey((key) => key + 1);
        }}
        title="Set a new password"
        confirmLabel="Confirm new password"
        submitLabel="Update password"
        expiredTitle="This link has expired"
        expiredBody="Reset links work once and expire quickly. Request a new one from the sign-in page."
        failedTitle="Could not check your reset link"
        failedBody="Check your connection and try again."
        signInHref={PAGE_ROUTES.LOGIN}
        LinkComponent={Link}
        passwordLabelSlot={<PasswordRequirementsHint />}
        mapErrorObject={(error) => authErrorMessage(error, 'update')}
        onSubmit={async (password) => {
          const { error: updateError } = await supabase.auth.updateUser({ password });
          if (updateError) return { error: updateError };
          toast.success('Password updated');
          router.push(PAGE_ROUTES.DASHBOARD);
          router.refresh();
          await navigatingAway();
        }}
      />
    </ElevatedCard>
  );
}
