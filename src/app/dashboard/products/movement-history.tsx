'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { stockMovementReasonLabel } from '@/lib/stock';
import type { StockMovement } from '@/lib/types';
import { getProductMovements } from './actions';

interface Props {
  productId: string;
  // Bumped by the parent after a new movement is recorded, to trigger a refetch.
  refreshKey: number;
  // Reports whether the plan caps history (true on Free), or null while
  // unknown or after a failed load, so siblings (the CSV download) can reflect
  // the plan. Must be a stable callback (a state setter).
  onCappedChange?: (capped: boolean | null) => void;
}

/** Plan-limited stock movements for a product, newest first. */
export function MovementHistory({ productId, refreshKey, onCappedChange }: Props) {
  const [movements, setMovements] = useState<StockMovement[] | null>(null);
  const [limit, setLimit] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Reset before the async fetch so a slow load never shows stale history
    // from the previously selected product.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset must run before the async fetch
    setMovements(null);
    setFailed(false);
    onCappedChange?.(null);
    getProductMovements(productId)
      .then((result) => {
        if (cancelled) return;
        if (!result.success) {
          setFailed(true);
          return;
        }
        setMovements(result.movements);
        setLimit(result.limit);
        onCappedChange?.(result.limit !== null);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [productId, refreshKey, retryKey, onCappedChange]);

  if (failed) {
    return (
      <div className="space-y-2 py-6 text-center text-sm">
        <p role="alert">Could not load stock history.</p>
        <button type="button" className="underline" onClick={() => setRetryKey((key) => key + 1)}>
          Try again
        </button>
      </div>
    );
  }
  if (movements === null) {
    return <p className="text-muted-foreground py-6 text-center text-sm">Loading history…</p>;
  }
  if (movements.length === 0) {
    return <p className="text-muted-foreground py-6 text-center text-sm">No stock changes yet</p>;
  }

  return (
    <div className="space-y-2">
      {movements.map((m) => (
        <div
          key={m.id}
          className="border-border flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium">{stockMovementReasonLabel(m.reason)}</p>
            <p className="text-muted-foreground truncate text-xs">
              {new Date(m.created_at).toLocaleString()}
              {m.note ? ` · ${m.note}` : ''}
            </p>
          </div>
          <span className="text-foreground flex shrink-0 items-center gap-2 font-mono text-sm font-semibold tabular-nums">
            <span
              aria-hidden="true"
              data-testid="delta-dot"
              className="bg-muted-foreground size-2 rounded-full"
            />
            {m.delta > 0 ? '+' : ''}
            {m.delta}
          </span>
        </div>
      ))}
      {limit !== null && (
        <p className="text-muted-foreground pt-1 text-xs">
          Free plan keeps the last {limit} changes.{' '}
          <Link href="/dashboard/plan" className="text-foreground underline">
            Pro
          </Link>{' '}
          keeps full history.
        </p>
      )}
    </div>
  );
}
