'use client';

import { BrandText } from '@/components/widgets';
import { ErrorPage, Wordmark } from '@merqo/ui';

/**
 * Root error boundary: replaces the raw Next error overlay in production if
 * an RSC throws (e.g. Supabase unreachable). Caught here, not global-error.tsx,
 * for anything below the root layout; see global-error.tsx for the one case
 * this doesn't cover.
 */
export default function RouteError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      {...props}
      wordmark={
        <Wordmark size="lg">
          <BrandText />
        </Wordmark>
      }
      eyebrow="Something went wrong"
      title="That didn't load"
      description="A hiccup on our end. It's usually a flaky connection. Try again."
    />
  );
}
