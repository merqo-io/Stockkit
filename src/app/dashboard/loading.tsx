import { ListSkeleton, StatTileSkeleton } from '@merqo/ui';
import { Skeleton } from '@merqo/ui/primitives';

// Next wraps this segment's page (and every nested page below it: overview,
// products, profile) in a Suspense boundary keyed to this file. The nav
// renders immediately; this shows while the incoming page loads (slow query,
// cold compile). It outlines a page (header, stat tiles, list rows) so the
// content area does not jump when the real one arrives. Every dashboard page
// sets `revalidate = 0`, so it applies on every navigation.
export default function Loading() {
  return (
    <div>
      <div className="mb-7 space-y-2.5" aria-hidden="true">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-56 max-w-full" />
      </div>
      <div
        data-testid="loading-tiles"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        aria-hidden="true"
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <StatTileSkeleton key={i} />
        ))}
      </div>
      <ListSkeleton rows={4} label="Loading…" className="mt-6" />
    </div>
  );
}
