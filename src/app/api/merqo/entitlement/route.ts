import { type NextRequest, NextResponse } from 'next/server';

import { guardMerqoRoute } from '@/lib/merqo-auth';
import { entitlementPayloadSchema } from '@/lib/merqo-entitlement-contract';
import { createServiceClient } from '@/lib/supabase/server';
import { withLogging } from '@/lib/utils/with-logging';

export const revalidate = 0;

const KIT = 'stockkit';

/**
 * Receives merqo's push of a vendor's entitlement and stores it in
 * stockkit.vendor_entitlements. Ordering by issued_at is decided atomically in
 * the database, so a stale or replayed push is a successful no-op.
 */
export const POST = withLogging(async (request: NextRequest): Promise<NextResponse> => {
  const denied = await guardMerqoRoute(request, 'entitlement', 'provision');
  if (denied) return denied;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }
  const parsed = entitlementPayloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }
  const payload = parsed.data;
  if (payload.kit !== KIT) {
    return NextResponse.json({ ok: false, error: 'wrong_kit' }, { status: 400 });
  }

  const supabase = await createServiceClient();
  const { data, error } = await supabase.rpc('apply_vendor_entitlement', {
    p_email: payload.email,
    p_tier: payload.tier,
    p_founder: payload.founder,
    p_stats_window: payload.stats_window,
    p_valid_until: payload.valid_until,
    p_issued_at: payload.issued_at,
  });
  if (error) {
    console.error('merqo entitlement: store failed', error.message);
    return NextResponse.json({ ok: false, error: 'store_failed' }, { status: 500 });
  }
  if (data === 'unknown_vendor') {
    return NextResponse.json({ ok: false, error: 'unknown_vendor' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
});
