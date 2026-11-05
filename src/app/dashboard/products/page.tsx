import { readAllRows } from '@/lib/read-all-rows';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { PRODUCT_COLUMNS } from '@/lib/columns';
import { ENTITLEMENTS } from '@/lib/plan';
import { createServerClient } from '@/lib/supabase/server';
import { readVendorTier } from '@/lib/vendor-entitlement';
import { ProductsWorkspace } from './products-workspace';

export const metadata: Metadata = { title: 'Products' };

// Product list + on-hand quantities change on every stock movement — never
// statically prerender.
export const revalidate = 0;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string | string[] }>;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { product } = await searchParams;
  const tier = (await readVendorTier(supabase, user.id)) ?? 'free';

  const { data, error } = await readAllRows((after) => {
    const query = supabase
      .from('products')
      .select(PRODUCT_COLUMNS)
      .order('id', { ascending: true })
      .limit(500);
    return after === null ? query : query.gt('id', after);
  });
  if (error) throw new Error('Could not load inventory');
  data?.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));

  return (
    <ProductsWorkspace
      initialProducts={data ?? []}
      maxActiveProducts={ENTITLEMENTS[tier].maxActiveProducts}
      initialSelectedId={typeof product === 'string' ? product : null}
    />
  );
}
