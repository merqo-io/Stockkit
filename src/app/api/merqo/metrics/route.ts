import { readAllRows } from '@/lib/read-all-rows';
import { type NextRequest, NextResponse } from 'next/server';

import { guardMerqoRoute } from '@/lib/merqo-auth';
import { computeStockkitMetrics } from '@/lib/metrics';
import { createServiceClient } from '@/lib/supabase/server';
import type { StockMovementReason } from '@/lib/types';
import { withLogging } from '@/lib/utils/with-logging';
import { readAllVendorTiers } from '@/lib/vendor-entitlement';

export const revalidate = 0;

export const GET = withLogging(async (request: NextRequest): Promise<NextResponse> => {
  const denied = await guardMerqoRoute(request, 'metrics', 'metrics');
  if (denied) return denied;

  const supabase = await createServiceClient();

  // Three independent reads — issue them concurrently so endpoint latency is
  // one round-trip, not the sum of three.
  const [vendorsRes, productsRes, movementsRes, tiersRes] = await Promise.all([
    readAllRows((after) => {
      const query = supabase
        .from('vendors')
        .select('id, created_at')
        .order('id', { ascending: true })
        .limit(500);
      return after === null ? query : query.gt('id', after);
    }),
    readAllRows((after) => {
      const query = supabase
        .from('products')
        .select('id, vendor_id, unit_cost_cents, on_hand')
        .order('id', { ascending: true })
        .limit(500);
      return after === null ? query : query.gt('id', after);
    }),
    readAllRows((after) => {
      const query = supabase
        .from('stock_movements')
        .select('id, vendor_id, reason, unit_cost_cents, created_at')
        .order('id', { ascending: true })
        .limit(500);
      return after === null ? query : query.gt('id', after);
    }),
    readAllVendorTiers(supabase),
  ]);

  if (tiersRes.error) {
    console.error('merqo metrics: read failed', tiersRes.error);
    return NextResponse.json({ error: 'Upstream unavailable' }, { status: 503 });
  }
  for (const r of [vendorsRes, productsRes, movementsRes]) {
    if (r.error) {
      console.error('merqo metrics: read failed', r.error.message);
      return NextResponse.json({ error: 'Upstream unavailable' }, { status: 503 });
    }
  }

  const metrics = computeStockkitMetrics({
    nowMs: Date.now(),
    vendors: (vendorsRes.data ?? []).map((v) => ({
      id: v.id,
      plan: tiersRes.tiers.get(v.id) ?? 'free',
      created_at: v.created_at,
    })),
    products: (productsRes.data ?? []) as {
      id: string;
      vendor_id: string;
      unit_cost_cents: number;
      on_hand: number;
    }[],
    movements: (movementsRes.data ?? []) as {
      vendor_id: string;
      reason: StockMovementReason;
      unit_cost_cents: number | null;
      created_at: string;
    }[],
  });

  return NextResponse.json({
    product: 'stockkit',
    generated_at: new Date().toISOString(),
    ...metrics,
  });
});
