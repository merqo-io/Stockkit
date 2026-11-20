import { beforeEach, describe, expect, it, vi } from 'vitest';

import { signOutAction } from './auth';

const { signOutMock, redirectMock } = vi.hoisted(() => ({
  signOutMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: async () => ({ auth: { signOut: signOutMock } }),
}));
vi.mock('next/navigation', () => ({ redirect: redirectMock }));

beforeEach(() => vi.clearAllMocks());

describe('signOutAction', () => {
  it('signs out, then redirects to /login', async () => {
    signOutMock.mockResolvedValue({ error: null });
    await signOutAction();
    expect(signOutMock).toHaveBeenCalledOnce();
    expect(redirectMock).toHaveBeenCalledWith('/login');
  });

  it('throws and does not redirect when Supabase reports an error', async () => {
    signOutMock.mockResolvedValue({ error: { message: 'boom' } });
    await expect(signOutAction()).rejects.toThrow('Could not sign out. Please try again.');
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
