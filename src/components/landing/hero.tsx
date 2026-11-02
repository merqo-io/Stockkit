import Link from 'next/link';

import { LedgerCardPreview } from '@/components/landing/ledger-card-preview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PAGE_ROUTES, WAITLIST_URL } from '@/lib/constants/routes';

interface HeroProps {
  authed?: boolean;
}

export function Hero({ authed = false }: HeroProps) {
  return (
    <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
      <div className="fade-rise text-center lg:text-left">
        <p className="text-primary font-mono text-sm font-semibold tracking-wider uppercase">
          stockkit
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
          <Badge variant="secondary">In build</Badge>
          <span className="text-muted-foreground text-sm">Built, not yet tried with vendors.</span>
        </div>
        <h1 className="font-display mt-3 text-4xl font-bold tracking-tight lg:text-6xl">
          Track stock in and out, and know what every product actually costs you.
        </h1>
        <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
          <Button asChild size="lg">
            {authed ? (
              <Link href={PAGE_ROUTES.DASHBOARD}>Go to dashboard</Link>
            ) : (
              <a href={WAITLIST_URL}>Join the waitlist</a>
            )}
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="#how">See how it works</a>
          </Button>
        </div>
        <p className="text-muted-foreground mt-6 text-sm">Own your data.</p>
      </div>
      <div className="fade-rise flex justify-center lg:justify-end">
        <LedgerCardPreview />
      </div>
    </div>
  );
}
