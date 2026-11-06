import { requireAdmin } from '@/lib/admin';
import { platformTotals, recentActivity } from '@/lib/admin-data';
import { stockMovementReasonLabel } from '@/lib/stock';
import { cn } from '@/lib/utils';
import { PageHeader, StatCard } from '@merqo/ui';

export const revalidate = 0;

export default async function AdminOverviewPage() {
  await requireAdmin();

  const [totals, activity] = await Promise.all([platformTotals(), recentActivity(15)]);

  return (
    <main className="mx-auto max-w-5xl px-5 py-7">
      <PageHeader eyebrow="Internal" title="Overview" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Vendors" value={String(totals.vendors)} valueClassName="font-mono" />
        <StatCard
          label="Free vendors"
          value={String(totals.freeVendors)}
          valueClassName="font-mono"
        />
        <StatCard
          label="Pro vendors"
          value={String(totals.proVendors)}
          valueClassName="font-mono"
        />
        <StatCard label="Products" value={String(totals.products)} valueClassName="font-mono" />
        <StatCard
          label="Active products"
          value={String(totals.activeProducts)}
          valueClassName="font-mono"
        />
        <StatCard
          label="Stock movements"
          value={String(totals.stockMovements)}
          valueClassName="font-mono"
        />
      </div>

      <section className="mt-8 space-y-3">
        <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
          Recent activity across all vendors
        </h2>
        <div className="border-border bg-card rounded-xl border p-5">
          <ul className="space-y-2.5">
            {activity.length > 0 ? (
              activity.map((event) => (
                <li key={event.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="min-w-0 truncate">
                      <span className="font-medium">{event.product_name ?? 'None'}</span>
                      <span className="text-muted-foreground ml-2">
                        {event.vendor_name ?? 'None'}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {stockMovementReasonLabel(event.reason)}
                      </span>
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span
                      className={cn(
                        'font-mono text-sm font-semibold tabular-nums',
                        event.delta > 0 ? 'text-stock-ok' : 'text-stock-out'
                      )}
                    >
                      {event.delta > 0 ? '+' : ''}
                      {event.delta}
                    </span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {new Date(event.created_at).toLocaleString()}
                    </span>
                  </span>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground text-sm">No activity yet.</li>
            )}
          </ul>
        </div>
      </section>
    </main>
  );
}
