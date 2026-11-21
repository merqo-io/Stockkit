import { signOutAction } from '@/app/actions/auth';
import { BrandText } from '@/components/widgets';
import { AcceptTermsForm, AuthShell, safeRedirectPath, Wordmark } from '@merqo/ui';
import { Button } from '@merqo/ui/primitives';
import { acceptLegalTerms } from './actions';

export const revalidate = 0;

// Deliberately does NOT call any legal-gate check (dashboard/layout.tsx's
// requireCurrentLegalAcceptance) — this page is what that gate redirects TO,
// so gating it the same way is an infinite redirect loop. acceptLegalTerms
// (actions.ts) re-checks for a signed-in user on submit and sends a
// signed-out visitor to /login.
// AcceptTermsPage has no slot for an exit, and a vendor who declines the
// terms would be stuck here, so the shell and form are composed instead.
export default async function LegalAcceptPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthShell
      wordmark={
        <Wordmark size="lg">
          <BrandText />
        </Wordmark>
      }
      title="Our terms have changed"
      subtitle="Review the updated terms and privacy policy to keep using stockkit."
      footer={
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" className="w-full">
            Sign out
          </Button>
        </form>
      }
    >
      <AcceptTermsForm action={acceptLegalTerms} next={safeRedirectPath(next, '/dashboard')} />
    </AuthShell>
  );
}
