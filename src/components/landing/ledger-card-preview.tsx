import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

import { STOCK_STATUS_DOT_CLASS } from '@/lib/stock';
import { cn } from '@merqo/ui/primitives';

// Sample data for illustration, not a real product.
const SAMPLE_ACTIVITY = [
  { icon: ArrowUpRight, tone: 'text-stock-ok', label: '+12 restock', time: '2h ago' },
  { icon: ArrowDownRight, tone: 'text-stock-low', label: '−3 waste', time: '5h ago' },
];

export function LedgerCardPreview() {
  return (
    <div className="bg-card mx-auto w-full max-w-sm rounded-lg border p-6">
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
      <div className="border-border mt-5 space-y-2 border-t pt-4">
        {SAMPLE_ACTIVITY.map((activity) => (
          <div key={activity.label} className="flex items-center gap-2 text-sm">
            <activity.icon className={cn('size-4', activity.tone)} aria-hidden />
            <span className="font-mono">{activity.label}</span>
            <span className="text-muted-foreground">· {activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
