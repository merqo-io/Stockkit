import { createHash } from 'node:crypto';

import { createServiceClient } from '@/lib/supabase/server';

export const RATE_LIMIT_MESSAGE = 'Too many tries. Please wait and try again.';

/**
 * Client IP from headers the platform sets itself. Vercel overwrites
 * x-vercel-forwarded-for; the proxy appends the real peer as the LAST
 * x-forwarded-for hop, while the first hop is whatever the client sent, so it
 * is never read.
 */
export function clientIp(hdrs: Headers): string | null {
  const vercel = hdrs.get('x-vercel-forwarded-for')?.split(',')[0]?.trim();
  if (vercel) return vercel;
  const real = hdrs.get('x-real-ip')?.trim();
  if (real) return real;
  const hops = hdrs.get('x-forwarded-for')?.split(',') ?? [];
  const last = hops[hops.length - 1]?.trim();
  return last || null;
}

/** Counter keys carry digests only, so the table holds no raw IPs or ids. */
export function digest(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export type LimitSpec = { key: string; limit: number; windowSeconds: number };

/**
 * 'limited' when any bucket is exhausted; 'error' when the limiter itself
 * failed (callers choose fail-open or fail-closed); otherwise 'allowed'.
 */
export type LimitOutcome = 'allowed' | 'limited' | 'error';

export async function checkLimits(specs: LimitSpec[]): Promise<LimitOutcome> {
  try {
    const supabase = await createServiceClient();
    for (const spec of specs) {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_key: spec.key,
        p_limit: spec.limit,
        p_window_seconds: spec.windowSeconds,
      });
      if (error) {
        console.error('rate limiter error', error.message);
        return 'error';
      }
      if (data !== true) return 'limited';
    }
    return 'allowed';
  } catch (err) {
    console.error('rate limiter threw', err instanceof Error ? err.message : 'unknown');
    return 'error';
  }
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
