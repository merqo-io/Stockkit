import { timingSafeEqual } from 'node:crypto';

import { NextResponse, type NextRequest } from 'next/server';

import { checkLimits, clientIp, digest, LIMITS, RATE_LIMIT_MESSAGE } from '@/lib/rate-limit';

/** Constant-time check that `request`'s bearer token equals `secret`. */
function bearerMatches(request: Request, secret: string | undefined): boolean {
  if (!secret) return false;
  const header = request.headers.get('authorization') ?? '';
  const prefix = 'Bearer ';
  if (!header.startsWith(prefix)) return false;
  const provided = Buffer.from(header.slice(prefix.length));
  const expected = Buffer.from(secret);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

/** Constant-time bearer check against MERQO_METRICS_SECRET. */
export function bearerOk(request: Request): boolean {
  return bearerMatches(request, process.env.MERQO_METRICS_SECRET);
}

/** Constant-time bearer check against MERQO_PROVISION_SECRET — deliberately a
 *  DIFFERENT env var from bearerOk's MERQO_METRICS_SECRET, matching qkit/
 *  paykit's convention: a leak of the routine metrics-polling secret must
 *  not also grant access to the provision route. */
export function provisionBearerOk(request: Request): boolean {
  return bearerMatches(request, process.env.MERQO_PROVISION_SECRET);
}

type BearerFailure = 'secret unset' | 'missing header' | 'wrong scheme' | 'mismatch';

function bearerFailure(request: Request, secret: string | undefined): BearerFailure | null {
  if (!secret) return 'secret unset';
  const header = request.headers.get('authorization');
  if (!header) return 'missing header';
  if (!header.startsWith('Bearer ')) return 'wrong scheme';
  return bearerMatches(request, secret) ? null : 'mismatch';
}

/**
 * Gate for every /api/merqo/* route: caps requests per route and client IP
 * before auth (so unauthenticated floods are bounded), then checks the bearer.
 * Returns the response to send, or null to proceed.
 *
 * The limiter fails open: bearer auth is the real gate, and a degraded limiter
 * must not break merqo's polling. The 401 log line carries the route, reason
 * and IP only, never the provided token or the secret.
 */
export async function guardMerqoRoute(
  request: NextRequest,
  route: string,
  kind: 'metrics' | 'provision'
): Promise<NextResponse | null> {
  const ip = clientIp(request.headers);
  // Without an IP the bucket is skipped rather than shared by every such caller.
  if (ip) {
    const outcome = await checkLimits([
      { key: `merqo:${route}:ip:${digest(ip)}`, limit: LIMITS.merqoIpPerMinute, windowSeconds: 60 },
    ]);
    if (outcome === 'limited') {
      return NextResponse.json(
        { error: RATE_LIMIT_MESSAGE },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
  }

  const secret =
    kind === 'provision' ? process.env.MERQO_PROVISION_SECRET : process.env.MERQO_METRICS_SECRET;
  const failure = bearerFailure(request, secret);
  if (failure) {
    console.warn(JSON.stringify({ event: 'merqo_auth_failed', route, reason: failure, ip }));
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
