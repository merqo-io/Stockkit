import { checkLegalAcceptance as check } from '@merqo/ui/auth';
import { redirect } from 'next/navigation';

import { createServiceClient } from '@/lib/supabase/server';

/**
 * Is this vendor's terms + privacy acceptance current with the versions
 * @merqo/ui's LEGAL_VERSIONS requires? merqo owns the acceptance record; the
 * shared check asks merqo and caches the answer in stockkit.legal_check_state.
 * It fails closed, so a missing secret or unreachable merqo routes the vendor
 * to /legal/accept rather than past the gate.
 */
export function checkLegalAcceptance(email: string): Promise<boolean> {
  return check(email, {
    createClient: createServiceClient,
    customerSecret: process.env.MERQO_CUSTOMER_SECRET,
    merqoBaseUrl: process.env.MERQO_BASE_URL,
  });
}

/**
 * Page/layout guard companion to the auth-gate check: bounce a signed-in
 * vendor with a stale or missing legal acceptance to the /legal/accept
 * interstitial. Called at the same point unauthenticated users are sent to
 * /login. A no-op when `email` is falsy (the caller has already handled the
 * no-session case) so it never runs after that redirect has fired.
 */
export async function requireCurrentLegalAcceptance(
  email: string | undefined | null
): Promise<void> {
  if (email && !(await checkLegalAcceptance(email))) {
    redirect('/legal/accept');
  }
}
