import type { SupabaseClient, User } from '@supabase/supabase-js';

import { toNavUser } from '@merqo/ui';

import { getOrCreateVendorProfile } from './merqo-vendor-profile';

type VendorNameRow = { name: string | null } | null;

/**
 * Nav user for the public landing. The label comes from the shared merqo
 * profile `stall_name`, the same source the dashboard uses, so both show the
 * same name. Creating the profile row on a public render is acceptable: it
 * is idempotent and keeps the two labels from drifting. On failure it falls
 * back to the local `vendors.name`; `toNavUser` handles a missing name, so
 * the dashboard's "Your stall" placeholder is deliberately not used here.
 */
export async function resolveLandingNavUser<
  Db,
  SchemaName extends string & Exclude<keyof Db, '__InternalSupabase'>,
>(
  supabase: SupabaseClient<Db, SchemaName>,
  user: User | null,
  readLocalRow: (userId: string) => PromiseLike<VendorNameRow>
) {
  if (!user) return toNavUser(null, null);
  const localName = (await readLocalRow(user.id))?.name ?? null;
  try {
    const profile = await getOrCreateVendorProfile(supabase, user.id, localName);
    return toNavUser(user, profile.stall_name);
  } catch (err) {
    console.error(
      'resolveLandingNavUser: shared vendor profile read failed',
      err instanceof Error ? err.message : err
    );
    return toNavUser(user, localName);
  }
}
