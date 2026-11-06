import { PageHeader, safeRedirectPath } from '@merqo/ui';
import { AcceptForm } from './accept-form';

export const revalidate = 0;

// Deliberately does NOT call any legal-gate check (dashboard/layout.tsx's
// requireCurrentLegalAcceptance) — this page is what that gate redirects TO,
// so gating it the same way is an infinite redirect loop. acceptLegalTerms
// (actions.ts) re-checks for a signed-in user on submit and sends a
// signed-out visitor to /login.
export default async function LegalAcceptPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <PageHeader eyebrow="Your account" title="Our terms have changed" className="mb-6">
        Review the updated terms and privacy policy to keep using stockkit.
      </PageHeader>
      <AcceptForm next={safeRedirectPath(next, '/dashboard')} />
    </div>
  );
}
