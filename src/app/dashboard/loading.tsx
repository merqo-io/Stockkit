// Next wraps this segment's page (and every nested page below it: overview,
// products, profile) in a Suspense boundary keyed to this file. The nav
// renders immediately; this shows while the incoming page loads (slow query,
// cold compile). It outlines a page (header, stat tiles, list rows) so the
// content area does not jump when the real one arrives. Every dashboard page
// sets `revalidate = 0`, so it applies on every navigation.
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse motion-reduce:animate-none">
      <span className="sr-only">Loading…</span>
      <div className="mb-7 space-y-2.5" aria-hidden="true">
        <div className="bg-muted h-3 w-24 rounded" />
        <div className="bg-muted h-8 w-56 max-w-full rounded-lg" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            data-testid="loading-tile"
            className="border-border bg-card space-y-3 rounded-xl border p-4"
          >
            <div className="bg-muted h-3 w-20 rounded" />
            <div className="bg-muted h-7 w-28 rounded" />
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-3" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} data-testid="loading-row" className="bg-muted h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
