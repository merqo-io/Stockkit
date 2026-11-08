'use client';

import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { STOCK_STATUS_DOT_CLASS } from '@/lib/stock';
import { ElevatedCard } from '@merqo/ui';
import { cn } from '@merqo/ui/primitives';

// Sample data for illustration, not a real product.
const SAMPLE_ACTIVITY = [
  { icon: ArrowUpRight, tone: 'text-stock-ok', label: '+12 restock', time: '2h ago' },
  { icon: ArrowDownRight, tone: 'text-stock-low', label: '−3 waste', time: '5h ago' },
];

export function LedgerCardPreview() {
  const [activityIndex, setActivityIndex] = useState(0);

  useEffect(() => {
    const reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const id = setInterval(() => {
      setActivityIndex((i) => (i + 1) % SAMPLE_ACTIVITY.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const activity = SAMPLE_ACTIVITY[activityIndex];

  return (
    <ElevatedCard className="fade-rise mx-auto w-full max-w-sm p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span aria-hidden className={cn('size-2.5 rounded-full', STOCK_STATUS_DOT_CLASS.ok)} />
          <span className="text-sm font-semibold">Whole Bean Coffee 1kg</span>
        </div>
        <span className="text-muted-foreground text-xs">In stock</span>
      </div>
      <div className="mt-5">
        <p className="text-muted-foreground text-xs tracking-wide uppercase">On hand</p>
        <p className="font-mono text-3xl font-semibold">42</p>
      </div>
      <div className="border-border mt-5 border-t pt-4">
        <div key={activityIndex} className="fade-rise flex items-center gap-2 text-sm">
          <activity.icon className={cn('size-4', activity.tone)} aria-hidden />
          <span className="font-mono">{activity.label}</span>
          <span className="text-muted-foreground">· {activity.time}</span>
        </div>
      </div>
    </ElevatedCard>
  );
}
