import { resolveTier, type Tier } from '@/lib/plan';
import { readAllRows } from '@/lib/read-all-rows';
import type { createServerClient, createServiceClient } from '@/lib/supabase/server';

type Client =
  Awaited<ReturnType<typeof createServerClient>> | Awaited<ReturnType<typeof createServiceClient>>;

/**
 * A single vendor's tier from the entitlement cache. `null` when the read
 * fails, so callers decide their own fail-closed behaviour. A vendor with no
 * cache row is free.
 */
export async function readVendorTier(
  supabase: Client,
  vendorId: string,
  now: Date = new Date()
): Promise<Tier | null> {
  const { data, error } = await supabase
    .from('vendor_entitlements')
    .select('tier, valid_until')
    .eq('vendor_id', vendorId)
    .maybeSingle();
  if (error) {
    console.error('readVendorTier failed', error.message);
    return null;
  }
  return resolveTier(data, now);
}

/**
 * Tier for every vendor that has a cache row, keyed by vendor id. Vendors
 * without a row are absent and read as free. Service-role callers only: the
 * own-row RLS policy hides other vendors from a signed-in client.
 */
export async function readAllVendorTiers(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  now: Date = new Date()
): Promise<{ tiers: Map<string, Tier>; error: string | null }> {
  const res = await readAllRows((after) => {
    const query = supabase
      .from('vendor_entitlements')
      .select('id:vendor_id, tier, valid_until')
      .order('vendor_id', { ascending: true })
      .limit(500);
    return after === null ? query : query.gt('vendor_id', after);
  });
  if (res.error) return { tiers: new Map(), error: res.error.message };
  const tiers = new Map<string, Tier>();
  for (const row of res.data ?? []) tiers.set(row.id, resolveTier(row, now));
  return { tiers, error: null };
}
