import { ListSkeleton, StatTileSkeleton } from '@merqo/ui';
import { Skeleton } from '@merqo/ui/primitives';

// Covers /admin, /admin/vendors and /admin/activity: all three are a header
// over either stat tiles or a table, so one outline serves them. The gated
// layout (requireAdmin) is not covered by this boundary and renders first.
export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-7">
      <div className="mb-7 space-y-2.5" aria-hidden="true">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-56 max-w-full" />
      </div>
      <div
        data-testid="loading-tiles"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        aria-hidden="true"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <StatTileSkeleton key={i} />
        ))}
      </div>
      <ListSkeleton rows={5} label="Loading…" className="mt-8" />
    </main>
  );
}
