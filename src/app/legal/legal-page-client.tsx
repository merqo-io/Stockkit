'use client';

import { BrandText } from '@/components/widgets';
import { LegalPage, Wordmark } from '@merqo/ui';
import Link from 'next/link';

// LegalPage is meant for Server Components, but the published bundle drops
// the "use client" boundary of the LegalDocument inside it, so rendering it
// from a Server Component fails with "Event handlers cannot be passed to
// Client Component props". Rendering it from this client module avoids that;
// drop the wrapper once the package keeps the boundary.
export function LegalPageClient({ doc, kit }: { doc: 'terms' | 'privacy'; kit?: string }) {
  return (
    <LegalPage
      doc={doc}
      kit={kit}
      // No href: LegalPage wraps the wordmark in the home link itself.
      wordmark={
        <Wordmark size="lg">
          <BrandText />
        </Wordmark>
      }
      LinkComponent={Link}
    />
  );
}
