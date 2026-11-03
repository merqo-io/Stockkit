import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { rpcMock } = vi.hoisted(() => ({ rpcMock: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(async () => ({ rpc: rpcMock, from: vi.fn() })),
}));

import { GET as metrics } from '@/app/api/merqo/metrics/route';
import { GET as activity } from '@/app/api/merqo/vendor-activity/route';
import { POST as provision } from '@/app/api/merqo/vendor-provision/route';
import { GET as status } from '@/app/api/merqo/vendor-status/route';

const SECRET = 'super-secret-value';
const TOKEN = 'wrong-token-value';

function req(path: string, method = 'GET', auth?: string) {
  return new NextRequest(`http://localhost/api/merqo/${path}`, {
    method,
    headers: { 'x-real-ip': '9.9.9.9', ...(auth ? { Authorization: auth } : {}) },
  });
}

const routes = [
  ['metrics', () => metrics(req('metrics'))],
  ['vendor-activity', () => activity(req('vendor-activity'))],
  ['vendor-status', () => status(req('vendor-status'))],
  ['vendor-provision', () => provision(req('vendor-provision', 'POST'))],
] as const;

describe('/api/merqo/* rate limit and 401 logging', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    rpcMock.mockReset();
    process.env.MERQO_METRICS_SECRET = SECRET;
    process.env.MERQO_PROVISION_SECRET = SECRET;
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it.each(routes)('%s returns 429 with Retry-After when limited', async (_name, call) => {
    rpcMock.mockResolvedValue({ data: false, error: null });
    const res = await call();
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('60');
  });

  it.each(routes)('%s fails open when the limiter errors', async (_name, call) => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'down' } });
    const res = await call();
    expect(res.status).toBe(401);
  });

  it('logs the 401 reason and IP without the token or secret', async () => {
    rpcMock.mockResolvedValue({ data: true, error: null });
    const res = await metrics(req('metrics', 'GET', `Bearer ${TOKEN}`));
    expect(res.status).toBe(401);
    const warn = vi.mocked(console.warn);
    expect(warn).toHaveBeenCalledTimes(1);
    const line = String(warn.mock.calls[0]?.[0]);
    expect(line).toContain('"route":"metrics"');
    expect(line).toContain('"reason":"mismatch"');
    expect(line).toContain('9.9.9.9');
    expect(line).not.toContain(TOKEN);
    expect(line).not.toContain(SECRET);
  });

  it('logs missing header, wrong scheme and unset secret reasons', async () => {
    rpcMock.mockResolvedValue({ data: true, error: null });
    await metrics(req('metrics'));
    await metrics(req('metrics', 'GET', 'Basic abc'));
    delete process.env.MERQO_METRICS_SECRET;
    await metrics(req('metrics', 'GET', 'Bearer x'));
    const lines = vi.mocked(console.warn).mock.calls.map((c) => String(c[0]));
    expect(lines[0]).toContain('missing header');
    expect(lines[1]).toContain('wrong scheme');
    expect(lines[2]).toContain('secret unset');
  });
});
