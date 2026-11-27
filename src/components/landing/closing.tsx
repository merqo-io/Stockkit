import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { PAGE_ROUTES, WAITLIST_URL } from '@/lib/constants/routes';
import { ClosingCall } from '@merqo/ui';

export function Closing({ authed = false }: { authed?: boolean }) {
  return (
    <section className="mx-auto max-w-5xl px-5 py-10">
      <ClosingCall
        heading="Know what is on your shelf."
        line="Log what comes in and what goes out."
        action={
          <Button asChild size="lg">
            {authed ? (
              <Link href={PAGE_ROUTES.DASHBOARD}>Go to dashboard</Link>
            ) : (
              <a href={WAITLIST_URL}>Join the waitlist</a>
            )}
          </Button>
        }
        aside={
          <p className="text-lg leading-[1.55]">
            Built, not yet tried with vendors. Join the waitlist to hear when it opens.
          </p>
        }
      />
    </section>
  );
}
