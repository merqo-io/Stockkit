import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { rpcMock } = vi.hoisted(() => ({ rpcMock: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(async () => ({ rpc: rpcMock })),
}));

import { POST } from '@/app/api/merqo/entitlement/route';
import { resolveTier } from '@/lib/plan';

const payload = {
  email: 'vendor@business.sg',
  kit: 'stockkit',
  tier: 'paid',
  founder: false,
  stats_window: '24h',
  event_pass: null,
  valid_until: '2026-12-01T00:00:00+08:00',
  issued_at: '2026-11-03T10:00:00+08:00',
};

function req(body: unknown, auth: string | null = 'Bearer test-secret') {
  return new NextRequest('http://localhost/api/merqo/entitlement', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: auth } : {}) },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/merqo/entitlement (stockkit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MERQO_PROVISION_SECRET = 'test-secret';
    rpcMock.mockResolvedValue({ data: 'stored', error: null });
  });

  it('401 when the bearer is missing', async () => {
    expect((await POST(req(payload, null))).status).toBe(401);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('401 when the bearer is wrong', async () => {
    expect((await POST(req(payload, 'Bearer nope'))).status).toBe(401);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('400 on malformed JSON', async () => {
    expect((await POST(req('{not json'))).status).toBe(400);
  });

  it('400 on a body that fails the contract', async () => {
    const res = await POST(req({ ...payload, email: 'not-an-email' }));
    expect(res.status).toBe(400);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('400 on a tier the contract rejects for this kit', async () => {
    const res = await POST(req({ ...payload, tier: 'starter' }));
    expect(res.status).toBe(400);
  });

  it('400 when the kit is not stockkit', async () => {
    const res = await POST(req({ ...payload, kit: 'loopkit' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'wrong_kit' });
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('404 for an email with no auth user', async () => {
    rpcMock.mockResolvedValue({ data: 'unknown_vendor', error: null });
    const res = await POST(req(payload));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ ok: false, error: 'unknown_vendor' });
  });

  it('200 and stores the entitlement through the atomic upsert fn', async () => {
    const res = await POST(req(payload));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(rpcMock).toHaveBeenCalledWith('apply_vendor_entitlement', {
      p_email: 'vendor@business.sg',
      p_tier: 'paid',
      p_founder: false,
      p_stats_window: '24h',
      p_valid_until: '2026-12-01T00:00:00+08:00',
      p_issued_at: '2026-11-03T10:00:00+08:00',
    });
  });

  it('200 as a no-op when the push is stale', async () => {
    rpcMock.mockResolvedValue({ data: 'stale', error: null });
    const res = await POST(req(payload));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('500 when the store fails', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'boom' } });
    const res = await POST(req(payload));
    expect(res.status).toBe(500);
  });

  it('a stored paid row whose valid_until has passed resolves to free', async () => {
    const stored = { tier: payload.tier, valid_until: payload.valid_until };
    expect(resolveTier(stored, new Date('2026-11-30T00:00:00Z'))).toBe('pro');
    expect(resolveTier(stored, new Date('2026-12-02T00:00:00Z'))).toBe('free');
  });
});
