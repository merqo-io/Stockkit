import { createServiceClient } from '@/lib/supabase/server';

/**
 * The stall name the dashboard shows (`merqo.vendor_profile.stall_name`),
 * read without `resolveVendorName`'s create-on-miss and without throwing, so
 * the public landing can label the account the same way. The table has no
 * authenticated-role policy, hence the service client; the id must come from
 * a verified session. Returns null when the row is missing or the read fails.
 */
export async function readVendorStallName(vendorId: string): Promise<string | null> {
  try {
    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .schema('merqo' as never)
      .from('vendor_profile' as never)
      .select('stall_name')
      .eq('vendor_id', vendorId)
      .maybeSingle();
    if (error) {
      console.error('readVendorStallName: shared vendor profile read failed', error.message);
      return null;
    }
    return (data as { stall_name?: string } | null)?.stall_name ?? null;
  } catch (err) {
    console.error(
      'readVendorStallName: shared vendor profile read failed',
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
