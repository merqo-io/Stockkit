// Mirrors the centred card in page.tsx so the card does not jump when the
// admin and factor lookups finish.
export default function Loading() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="flex min-h-screen animate-pulse items-center justify-center p-5 motion-reduce:animate-none"
    >
      <span className="sr-only">Loading…</span>
      <div
        data-testid="loading-card"
        className="bg-card w-full max-w-md space-y-6 rounded-2xl border px-7 py-10 shadow-sm"
        aria-hidden="true"
      >
        <div className="bg-muted h-7 w-28 rounded" />
        <div className="bg-muted h-9 w-64 max-w-full rounded-lg" />
        <div className="bg-muted h-11 w-full rounded-lg" />
      </div>
    </main>
  );
}
