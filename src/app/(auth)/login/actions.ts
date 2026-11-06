'use server';

import type { ActionResult } from '@/lib/action-result';
import {
  checkLimits,
  clientIp,
  LIMITS,
  RATE_LIMIT_MESSAGE,
  userAndIpSpecs,
} from '@/lib/rate-limit';
import { vendorSchema } from '@/lib/schemas';
import { createServerClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

/**
 * Finish setting up a newly signed-up vendor: create their `vendors` row (the
 * stall name they entered on the sign-up form) and best-effort register them
 * into the shared `merqo.vendor_profile` table via `stockkit.sync_vendor_profile`
 * (migration 0003). The shared-profile sync never fails the caller — a missed
 * sync is fixable later; failing signup over it would be worse.
 */
export async function completeSignup(stallName: string): Promise<ActionResult> {
  const parsed = vendorSchema.safeParse({ name: stallName });
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Enter your business name' };

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  // Fails closed: signup is abuse-sensitive and the vendor can retry later.
  const outcome = await checkLimits(
    userAndIpSpecs('signup', user.id, clientIp(await headers()), {
      user: LIMITS.signupUser,
      ip: LIMITS.signupIp,
    })
  );
  if (outcome !== 'allowed') return { success: false, error: RATE_LIMIT_MESSAGE };

  const { error } = await supabase.from('vendors').upsert({ id: user.id, name: parsed.data.name });
  if (error) {
    console.error('completeSignup vendor upsert failed', error.message);
    return { success: false, error: 'Could not set up your account' };
  }

  try {
    const { error: syncError } = await supabase.rpc('sync_vendor_profile', {
      p_stall_name: parsed.data.name,
    });
    if (syncError) console.error('sync_vendor_profile failed', syncError.message);
  } catch {
    console.error('sync_vendor_profile rejected');
  }

  return { success: true };
}
