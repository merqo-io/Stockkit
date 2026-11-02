import { beforeEach, expect, it, vi } from 'vitest';
import { completeSignup } from './actions';
const mocks = vi.hoisted(() => ({ upsert: vi.fn(), rpc: vi.fn(), limits: vi.fn() }));
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-real-ip': '1.2.3.4' }),
}));
vi.mock('@/lib/rate-limit', async (orig) => ({
  ...(await orig<typeof import('@/lib/rate-limit')>()),
  checkLimits: mocks.limits,
}));
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(async () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'vendor-a' } } }) },
    from: () => ({ upsert: mocks.upsert }),
    rpc: mocks.rpc,
  })),
}));
beforeEach(() => {
  vi.resetAllMocks();
  mocks.limits.mockResolvedValue('allowed');
  mocks.upsert.mockResolvedValue({ error: null });
  mocks.rpc.mockResolvedValue({ error: null });
});
it.each(['returned', 'rejected'])('keeps signup successful after %s sync failure', async (kind) => {
  if (kind === 'returned') mocks.rpc.mockResolvedValue({ error: { message: 'offline' } });
  else mocks.rpc.mockRejectedValue(new Error('offline'));
  expect(await completeSignup('Rice stall')).toEqual({ success: true });
  expect(mocks.upsert).toHaveBeenCalledWith({ id: 'vendor-a', name: 'Rice stall' });
});
it.each(['limited', 'error'])('fails closed when the limiter says %s', async (outcome) => {
  mocks.limits.mockResolvedValue(outcome);
  expect(await completeSignup('Rice stall')).toEqual({
    success: false,
    error: 'Too many tries. Please wait and try again.',
  });
  expect(mocks.upsert).not.toHaveBeenCalled();
});
it('limits signup per user and per IP', async () => {
  await completeSignup('Rice stall');
  const specs = mocks.limits.mock.calls[0]?.[0] as { limit: number }[];
  expect(specs.map((s) => s.limit)).toEqual([5, 20]);
});
it('does not mask a failed primary vendor write', async () => {
  mocks.upsert.mockResolvedValue({ error: { message: 'denied' } });
  expect((await completeSignup('Rice stall')).success).toBe(false);
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it('does not mask a rejected primary vendor write', async () => {
  mocks.upsert.mockRejectedValue(new Error('offline'));
  await expect(completeSignup('Rice stall')).rejects.toThrow('offline');
  expect(mocks.rpc).not.toHaveBeenCalled();
});
