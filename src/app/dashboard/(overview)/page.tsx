import { readAllRows } from '@/lib/read-all-rows';
import { ElevatedCard, StatTile } from '@merqo/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/page-header';
import { StockStatusIndicator } from '@/components/stock-status-indicator';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PRODUCT_COLUMNS } from '@/lib/columns';
import { PAGE_ROUTES } from '@/lib/constants/routes';
import { formatPrice } from '@/lib/schemas';
import { stockStatusFor } from '@/lib/stock';
import { createServerClient } from '@/lib/supabase/server';
import { cn, LEDGER_LG_CLASS } from '@/lib/utils';

export const metadata: Metadata = { title: 'Overview' };

// Vendor data changes on every stock movement — never statically prerender.
export const revalidate = 0;

// Stock colours mark status only, via a dot; the numeral stays foreground for
// contrast.
const STATUS_DOT_CLASS =
  'before:mr-2.5 before:inline-block before:size-2.5 before:rounded-full before:align-middle';

export default async function DashboardOverviewPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data, error } = await readAllRows((after) => {
    const query = supabase
      .from('products')
      .select(PRODUCT_COLUMNS)
      .eq('is_active', true)
      .order('id', { ascending: true })
      .limit(500);
    return after === null ? query : query.gt('id', after);
  });
  if (error) throw new Error('Could not load inventory');
  data?.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  const products = data ?? [];

  if (products.length === 0) {
    return (
      <div>
        <PageHeader eyebrow="Inventory" title="Overview">
          Your stock at a glance.
        </PageHeader>
        <Card className="mt-8" data-tour="inventory-value">
          <CardHeader>
            <CardTitle>Add your first product</CardTitle>
            <CardDescription>
              Once you add a product, you&apos;ll see its stock value and low-stock alerts here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={PAGE_ROUTES.PRODUCTS}>Add a product</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalValueCents = products.reduce((sum, p) => sum + p.on_hand * p.unit_cost_cents, 0);
  const lowStock = products.filter((p) => p.on_hand > 0 && p.on_hand <= p.low_stock_threshold);
  const outOfStock = products.filter((p) => p.on_hand <= 0);
  const needsAttention = [...outOfStock, ...lowStock];
  const urgent = needsAttention.slice(0, 5);
  const moreCount = needsAttention.length - urgent.length;

  return (
    <div>
      <PageHeader eyebrow="Inventory" title="Overview">
        Your stock at a glance.
      </PageHeader>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ElevatedCard className="p-5" data-tour="inventory-value">
          <StatTile
            label="Inventory value"
            value={formatPrice(totalValueCents)}
            valueClassName={LEDGER_LG_CLASS}
          />
        </ElevatedCard>
        <ElevatedCard className="p-5">
          <StatTile
            label="Low stock"
            value={String(lowStock.length)}
            valueClassName={cn(LEDGER_LG_CLASS, STATUS_DOT_CLASS, 'before:bg-stock-low')}
          />
        </ElevatedCard>
        <ElevatedCard className="p-5">
          <StatTile
            label="Out of stock"
            value={String(outOfStock.length)}
            valueClassName={cn(LEDGER_LG_CLASS, STATUS_DOT_CLASS, 'before:bg-stock-out')}
          />
        </ElevatedCard>
      </div>

      {urgent.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Needs attention</CardTitle>
            <CardDescription>Your most urgent low or out-of-stock products.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {urgent.map((p) => {
              const status = stockStatusFor(p.on_hand, p.low_stock_threshold);
              return (
                <Link
                  key={p.id}
                  href={PAGE_ROUTES.PRODUCTS}
                  className="border-border hover:bg-accent/50 focus-visible:ring-ring focus-visible:ring-offset-background flex items-center justify-between gap-4 rounded-lg border px-4 py-3 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-muted-foreground text-xs">
                      Low at <span className="font-mono tabular-nums">{p.low_stock_threshold}</span>{' '}
                      {p.unit}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StockStatusIndicator status={status} />
                    <span className="font-mono text-sm font-semibold tabular-nums">
                      {p.on_hand} {p.unit}
                    </span>
                  </div>
                </Link>
              );
            })}
            {moreCount > 0 && (
              <Link
                href={PAGE_ROUTES.PRODUCTS}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-background inline-block rounded-sm text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                +{moreCount} more
              </Link>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={PAGE_ROUTES.PRODUCTS}>View all products</Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
