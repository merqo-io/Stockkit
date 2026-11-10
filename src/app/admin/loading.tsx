// Covers /admin, /admin/vendors and /admin/activity: all three are a header
// over either stat tiles or a table, so one outline serves them. The gated
// layout (requireAdmin) is not covered by this boundary and renders first.
export default function Loading() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="mx-auto max-w-5xl animate-pulse px-5 py-7 motion-reduce:animate-none"
    >
      <span className="sr-only">Loading…</span>
      <div className="mb-7 space-y-2.5" aria-hidden="true">
        <div className="bg-muted h-3 w-24 rounded" />
        <div className="bg-muted h-8 w-56 max-w-full rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            data-testid="loading-tile"
            className="border-border bg-card space-y-3 rounded-xl border p-4"
          >
            <div className="bg-muted h-3 w-16 rounded" />
            <div className="bg-muted h-7 w-12 rounded" />
          </div>
        ))}
      </div>
      <div className="mt-8 space-y-3" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} data-testid="loading-row" className="bg-muted h-12 w-full rounded-lg" />
        ))}
      </div>
    </main>
  );
}
