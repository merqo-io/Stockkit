import {
  digest,
  rateLimitCheck,
  clientIp as sharedClientIp,
  type RateLimitStore,
} from '@merqo/ui/kit-api';

import { createServiceClient } from '@/lib/supabase/server';

export { digest };

export const RATE_LIMIT_MESSAGE = 'Too many tries. Please wait and try again.';

// Vercel overwrites x-vercel-forwarded-for; for x-forwarded-for the shared
// helper reads the last hop, the one the proxy appended, never the first,
// which is whatever the client sent.
const TRUSTED_IP_HEADERS = ['x-vercel-forwarded-for', 'x-real-ip', 'x-forwarded-for'];

export function clientIp(hdrs: Headers): string | null {
  return sharedClientIp(hdrs, { trustedHeaders: TRUSTED_IP_HEADERS });
}

export type LimitSpec = { key: string; limit: number; windowSeconds: number };

/**
 * 'limited' when any bucket is exhausted; 'error' when the limiter itself
 * failed (callers choose fail-open or fail-closed); otherwise 'allowed'.
 */
export type LimitOutcome = 'allowed' | 'limited' | 'error';

// Counter keys carry digests only, so the table holds no raw IPs or ids.
const store: RateLimitStore = {
  async hit(key, limit, windowSeconds) {
    const supabase = await createServiceClient();
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) throw new Error(error.message);
    return data === true;
  },
};

export async function checkLimits(specs: LimitSpec[]): Promise<LimitOutcome> {
  for (const spec of specs) {
    const verdict = await rateLimitCheck(store, spec.key, spec.limit, spec.windowSeconds);
    if (verdict === 'error') return 'error';
    if (verdict === 'limited') return 'limited';
  }
  return 'allowed';
}

const HOUR = 3600;

/** Per-user bucket plus a per-IP bucket when an IP is known. */
export function userAndIpSpecs(
  action: string,
  userId: string,
  ip: string | null,
  limits: { user: number; ip?: number }
): LimitSpec[] {
  const specs: LimitSpec[] = [
    { key: `${action}:user:${digest(userId)}`, limit: limits.user, windowSeconds: HOUR },
  ];
  // Without an IP the bucket is skipped rather than shared by every such caller.
  if (ip && limits.ip !== undefined) {
    specs.push({ key: `${action}:ip:${digest(ip)}`, limit: limits.ip, windowSeconds: HOUR });
  }
  return specs;
}

export const LIMITS = {
  signupUser: 5,
  signupIp: 20,
  feedbackUser: 5,
  profileUser: 10,
  merqoIpPerMinute: 120,
} as const;
