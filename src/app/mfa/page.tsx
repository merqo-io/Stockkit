import { BrandText } from '@/components/widgets';
import { requireAdminMember } from '@/lib/admin';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MfaForm } from './mfa-form';

export const metadata = { title: 'Two-step sign-in' };

// Lives outside /admin so the aal2 gate on /admin cannot loop back here.
export default async function MfaPage() {
  await requireAdminMember();
  const supabase = await createServerClient();
  const { data: level } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (level?.currentLevel === 'aal2') redirect('/admin');

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const verified = factors?.totp[0] ?? null;
  const staleFactorIds = (factors?.all ?? [])
    .filter((f) => f.factor_type === 'totp' && f.status === 'unverified')
    .map((f) => f.id);

  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <div className="bg-card w-full max-w-md rounded-2xl border px-7 py-10 shadow-sm">
        <span className="text-2xl font-bold">
          <BrandText />
        </span>
        <h1 className="font-display mt-6 text-3xl font-bold tracking-tight">Two-step sign-in</h1>
        <div className="mt-6">
          <MfaForm verifiedFactorId={verified?.id ?? null} staleFactorIds={staleFactorIds} />
        </div>
      </div>
    </main>
  );
}
