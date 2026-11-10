'use client';

import { authErrorMessage } from '@/lib/auth-error-message';
import { createClient } from '@/lib/supabase/client';
import { MfaForm as SharedMfaForm, navigatingAway } from '@merqo/ui';
import { useRouter } from 'next/navigation';

type Props = {
  verifiedFactorId: string | null;
  staleFactorIds: string[];
};

const ENROL_FAILED = 'enrol_failed';

// The shared form hands every returned string and thrown error to mapError, so
// the enrol failure travels as a sentinel and everything else is a Supabase
// error code or message that authErrorMessage turns into vendor copy.
function mapMfaError(raw: string): string {
  if (raw === ENROL_FAILED) return 'Could not start setup. Try again.';
  return authErrorMessage(
    { code: raw, message: raw },
    "That code didn't work. Enter the latest code from your app."
  );
}

export function MfaForm({ verifiedFactorId, staleFactorIds }: Props) {
  const router = useRouter();

  return (
    <SharedMfaForm
      hasFactor={verifiedFactorId !== null}
      mapError={mapMfaError}
      onEnrol={async () => {
        const supabase = createClient();
        for (const id of staleFactorIds) {
          await supabase.auth.mfa.unenroll({ factorId: id });
        }
        const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
        if (error || !data) return ENROL_FAILED;
        return { qr: data.totp.qr_code, secret: data.totp.secret, factorId: data.id };
      }}
      onVerify={async (code, context) => {
        const factorId = context.factorId ?? verifiedFactorId;
        if (!factorId) return ENROL_FAILED;
        const { error } = await createClient().auth.mfa.challengeAndVerify({ factorId, code });
        if (error) return error.code ?? error.message;
        router.replace('/admin');
        router.refresh();
        await navigatingAway();
      }}
    />
  );
}
