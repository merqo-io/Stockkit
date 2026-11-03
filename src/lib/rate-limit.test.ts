import { beforeEach, describe, expect, it, vi } from 'vitest';

const { rpcMock } = vi.hoisted(() => ({ rpcMock: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(async () => ({ rpc: rpcMock })),
}));

import { checkLimits, clientIp, userAndIpSpecs } from '@/lib/rate-limit';

function h(init: Record<string, string>) {
  return new Headers(init);
}

describe('clientIp', () => {
  it('prefers x-vercel-forwarded-for (first entry)', () => {
    expect(
      clientIp(
        h({
          'x-vercel-forwarded-for': '1.1.1.1, 2.2.2.2',
          'x-real-ip': '3.3.3.3',
          'x-forwarded-for': '4.4.4.4, 5.5.5.5',
        })
      )
    ).toBe('1.1.1.1');
  });

  it('uses x-real-ip next', () => {
    expect(clientIp(h({ 'x-real-ip': '3.3.3.3', 'x-forwarded-for': '4.4.4.4, 5.5.5.5' }))).toBe(
      '3.3.3.3'
    );
  });

  it('uses the last x-forwarded-for hop and never the first', () => {
    expect(clientIp(h({ 'x-forwarded-for': '6.6.6.6, 4.4.4.4, 5.5.5.5' }))).toBe('5.5.5.5');
  });

  it('returns null without any header', () => {
    expect(clientIp(h({}))).toBeNull();
  });
});

describe('userAndIpSpecs', () => {
  it('skips the IP bucket without an IP and hashes the keys', () => {
    const specs = userAndIpSpecs('signup', 'user-1', null, { user: 5, ip: 20 });
    expect(specs).toHaveLength(1);
    expect(specs[0]?.key).not.toContain('user-1');
  });

  it('adds an IP bucket when an IP is known', () => {
    expect(userAndIpSpecs('signup', 'user-1', '1.1.1.1', { user: 5, ip: 20 })).toHaveLength(2);
  });
});

describe('checkLimits', () => {
  const specs = [{ key: 'k', limit: 1, windowSeconds: 60 }];
  beforeEach(() => {
    rpcMock.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('allowed when every bucket passes', async () => {
    rpcMock.mockResolvedValue({ data: true, error: null });
    expect(await checkLimits(specs)).toBe('allowed');
  });

  it('limited when the rpc says no', async () => {
    rpcMock.mockResolvedValue({ data: false, error: null });
    expect(await checkLimits(specs)).toBe('limited');
  });

  it('error on rpc error and on throw', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'down' } });
    expect(await checkLimits(specs)).toBe('error');
    rpcMock.mockRejectedValue(new Error('boom'));
    expect(await checkLimits(specs)).toBe('error');
  });
});
