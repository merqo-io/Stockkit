import type { Metadata } from 'next';
import Link from 'next/link';

import { BrandText } from '@/components/widgets';
import { PAGE_ROUTES } from '@/lib/constants/routes';
import { AuthConfirmForm, AuthConfirmInvalid, ElevatedCard } from '@merqo/ui';
import { readAuthConfirmParams } from '@merqo/ui/auth';

export const metadata: Metadata = {
  title: 'Continue',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export const revalidate = 0;

export default async function AuthConfirmPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = readAuthConfirmParams(await searchParams);

  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href={PAGE_ROUTES.HOME}
            className="font-display text-3xl font-semibold tracking-tight"
          >
            <BrandText />
          </Link>
        </div>
        <ElevatedCard className="px-7 py-9">
          {params ? (
            <AuthConfirmForm tokenHash={params.tokenHash} type={params.type} next={params.next} />
          ) : (
            <AuthConfirmInvalid loginHref={PAGE_ROUTES.LOGIN} />
          )}
        </ElevatedCard>
      </div>
    </main>
  );
}
