import { BrandText } from '@/components/widgets';
import { PAGE_ROUTES } from '@/lib/constants/routes';
import { NotFound, Wordmark } from '@merqo/ui';
import Link from 'next/link';

/** Branded 404, reached e.g. when a vendor opens a stale or mistyped link. */
export default function NotFoundPage() {
  return (
    <NotFound
      code="404"
      wordmark={
        <Wordmark size="lg">
          <BrandText />
        </Wordmark>
      }
      title="Not found"
      description="This page doesn't exist. Check the link, or head back to the start."
      homeHref={PAGE_ROUTES.HOME}
      homeLabel="Back to start"
      LinkComponent={Link}
    />
  );
}
