import Link from 'next/link';

import { BrandText } from '@/components/widgets';
import { PAGE_ROUTES } from '@/lib/constants/routes';
import { ResetPasswordForm } from './reset-password-form';

export const revalidate = 0;

export default function ResetPasswordPage() {
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
          <p className="text-muted-foreground mt-1 text-sm">
            Choose a new password for your account.
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </main>
  );
}
