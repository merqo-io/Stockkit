import type { createServerClient } from '@/lib/supabase/server';

type ServerSupabase = Awaited<ReturnType<typeof createServerClient>>;

/**
 * Creates the local `vendors` row for the signed-in user if none exists.
 *
 * Two entry points can reach stockkit without the email/password flow's
 * completeSignup (login/actions.ts): Google OAuth via /auth/callback, and a
 * vendor already signed in through merqo — the auth cookie is shared across
 * *.merqo.io, so they land on /dashboard directly. Without a row,
 * products.vendor_id's FK fails and markTourSeen's `.update().eq('id', ...)`
 * matches zero rows and silently never stamps. `ignoreDuplicates` makes this
 * a one-time self-heal: an existing row (and any stall name a vendor has
 * since set) is left untouched.
 *
 * Failures are logged, never thrown, so a transient DB error cannot block
 * sign-in or dashboard rendering.
 *
 * @returns the name the row was seeded with, or null when there is no user
 * or the upsert failed.
 */
export async function ensureVendorRow(
  supabase: ServerSupabase,
  knownUser?: { id: string; user_metadata?: Record<string, unknown> | null }
): Promise<string | null> {
  const user = knownUser ?? (await supabase.auth.getUser()).data.user;
  if (!user) return null;

  const meta = user.user_metadata ?? {};
  const displayName = (
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    'Your stall'
  ).slice(0, 100);

  const { error } = await supabase
    .from('vendors')
    .upsert({ id: user.id, name: displayName }, { onConflict: 'id', ignoreDuplicates: true });
  if (error) {
    console.error('ensureVendorRow failed', error.message);
    return null;
  }
  return displayName;
}
