import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getUserMock, rpcMock, schemaMock, createServerClientMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  rpcMock: vi.fn(),
  schemaMock: vi.fn(),
  createServerClientMock: vi.fn(),
}));

const { limitsMock } = vi.hoisted(() => ({ limitsMock: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: createServerClientMock,
}));
vi.mock('@/lib/rate-limit', async (orig) => ({
  ...(await orig<typeof import('@/lib/rate-limit')>()),
  checkLimits: limitsMock,
}));

beforeEach(() => {
  limitsMock.mockReset().mockResolvedValue('allowed');
  getUserMock.mockReset().mockResolvedValue({ data: { user: { id: 'v1' } } });
  rpcMock.mockReset().mockResolvedValue({ data: { id: 'fb1' }, error: null });
  schemaMock.mockReset().mockReturnValue({ rpc: rpcMock });
  createServerClientMock.mockReset().mockResolvedValue({
    auth: { getUser: getUserMock },
    schema: schemaMock,
  });
});

describe('submitFeedbackAction', () => {
  it("calls the RPC with stockkit's kit slug, nps, and message", async () => {
    const { submitFeedbackAction } = await import('./feedback');
    const result = await submitFeedbackAction({ nps: 9, message: 'Great!' });
    expect(result).toEqual({ success: true });
    expect(rpcMock).toHaveBeenCalledWith('submit_vendor_feedback', {
      p_kit_slug: 'stockkit',
      p_nps: 9,
      p_message: 'Great!',
    });
  });

  it('rejects an out-of-range nps before calling the RPC', async () => {
    const { submitFeedbackAction } = await import('./feedback');
    const result = await submitFeedbackAction({ nps: 11 });
    expect(result.success).toBe(false);
    expect(getUserMock).not.toHaveBeenCalled();
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it.each(['limited', 'error'])('fails closed when the limiter says %s', async (outcome) => {
    limitsMock.mockResolvedValue(outcome);
    const { submitFeedbackAction } = await import('./feedback');
    const result = await submitFeedbackAction({ nps: 5 });
    expect(result).toEqual({
      success: false,
      error: 'Too many tries. Please wait and try again.',
    });
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('rejects an unauthenticated user', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const { submitFeedbackAction } = await import('./feedback');
    const result = await submitFeedbackAction({ nps: 5 });
    expect(result).toEqual({ success: false, error: 'Please sign in first' });
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('surfaces a friendly error when the RPC fails', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'db down' } });
    const { submitFeedbackAction } = await import('./feedback');
    const result = await submitFeedbackAction({ nps: 5 });
    expect(result).toEqual({
      success: false,
      error: 'Could not send feedback',
    });
  });
});
