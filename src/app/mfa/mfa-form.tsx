'use client';

import { authErrorMessage } from '@/lib/auth-error-message';
import { createClient } from '@/lib/supabase/client';
import { MfaForm as SharedMfaForm, navigatingAway } from '@merqo/ui';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

type Props = {
  verifiedFactorId: string | null;
  staleFactorIds: string[];
};

type VerifyError = { code?: string | null; message?: string | null };

const ENROL_FAILED = 'enrol_failed';
const VERIFY_FAILED = 'verify_failed';
const NO_FACTOR = 'no_factor';

export function MfaForm({ verifiedFactorId, staleFactorIds }: Props) {
  const router = useRouter();
  // The shared form only passes a string to mapError. Keeping the Supabase
  // error here lets authErrorMessage match on both its code and its message.
  const verifyError = useRef<VerifyError | null>(null);

  function mapMfaError(raw: string): string {
    if (raw === ENROL_FAILED) return 'Could not start setup. Try again.';
    if (raw === NO_FACTOR) return 'Enter the 6-digit code from your authenticator app.';
    return authErrorMessage(
      raw === VERIFY_FAILED ? verifyError.current : { code: raw, message: raw },
      "That code didn't work. Enter the latest code from your app."
    );
  }

  return (
    <SharedMfaForm
      hasFactor={verifiedFactorId !== null}
      mapError={mapMfaError}
      onEnrol={async () => {
        try {
          const supabase = createClient();
          for (const id of staleFactorIds) {
            await supabase.auth.mfa.unenroll({ factorId: id });
          }
          const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
          if (error || !data) return ENROL_FAILED;
          return { qr: data.totp.qr_code, secret: data.totp.secret, factorId: data.id };
        } catch {
          return ENROL_FAILED;
        }
      }}
      onVerify={async (code, context) => {
        const factorId = context.factorId ?? verifiedFactorId;
        if (!factorId) return NO_FACTOR;
        const { error } = await createClient().auth.mfa.challengeAndVerify({ factorId, code });
        if (error) {
          verifyError.current = error;
          return VERIFY_FAILED;
        }
        router.replace('/admin');
        router.refresh();
        await navigatingAway();
      }}
    />
  );
}
