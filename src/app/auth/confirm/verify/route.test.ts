import { beforeEach, describe, expect, it, vi } from 'vitest';

const { verifyOtpMock, getUserMock, upsertMock, fromMock, createServerClientMock } = vi.hoisted(
  () => ({
    verifyOtpMock: vi.fn(),
    getUserMock: vi.fn(),
    upsertMock: vi.fn(),
    fromMock: vi.fn(),
    createServerClientMock: vi.fn(),
  })
);

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: createServerClientMock,
}));

beforeEach(() => {
  verifyOtpMock.mockReset().mockResolvedValue({ data: {}, error: null });
  getUserMock.mockReset().mockResolvedValue({ data: { user: { id: 'v1', user_metadata: {} } } });
  upsertMock.mockReset().mockResolvedValue({ error: null });
  fromMock.mockReset().mockReturnValue({ upsert: upsertMock });
  createServerClientMock.mockReset().mockResolvedValue({
    auth: { verifyOtp: verifyOtpMock, getUser: getUserMock },
    from: fromMock,
  });
});

function post(fields: Record<string, string>, headers: Record<string, string> = {}) {
  return new Request('http://localhost/auth/confirm/verify', {
    method: 'POST',
    headers: { origin: 'http://localhost', ...headers },
    body: new URLSearchParams(fields),
  });
}

describe('POST /auth/confirm/verify', () => {
  it('lands on /dashboard after a successful verification and heals the vendor row', async () => {
    const { POST } = await import('./route');
    const res = await POST(post({ token_hash: 'th', type: 'magiclink' }));
    expect(verifyOtpMock).toHaveBeenCalledWith({ token_hash: 'th', type: 'magiclink' });
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('http://localhost/dashboard');
    expect(upsertMock).toHaveBeenCalledWith(
      { id: 'v1', name: 'Your stall' },
      { onConflict: 'id', ignoreDuplicates: true }
    );
  });

  it('honours a safe next path', async () => {
    const { POST } = await import('./route');
    const res = await POST(post({ token_hash: 'th', type: 'email', next: '/dashboard/products' }));
    expect(res.headers.get('location')).toBe('http://localhost/dashboard/products');
  });

  it('sends a recovery token to /reset-password', async () => {
    const { POST } = await import('./route');
    const res = await POST(post({ token_hash: 'th', type: 'recovery' }));
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('http://localhost/reset-password');
  });

  it('goes to /login?error=link and skips the vendor row when verification fails', async () => {
    verifyOtpMock.mockResolvedValue({ data: {}, error: { message: 'expired' } });
    const { POST } = await import('./route');
    const res = await POST(post({ token_hash: 'th', type: 'magiclink' }));
    expect(res.headers.get('location')).toBe('http://localhost/login?error=link');
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it('rejects a cross-origin POST without verifying', async () => {
    const { POST } = await import('./route');
    const res = await POST(
      post({ token_hash: 'th', type: 'magiclink' }, { origin: 'https://evil.example' })
    );
    expect(res.headers.get('location')).toBe('http://localhost/login?error=link');
    expect(verifyOtpMock).not.toHaveBeenCalled();
  });
});
