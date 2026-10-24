import { NextRequest, type NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getUserMock, createServerClientMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  createServerClientMock: vi.fn(),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: createServerClientMock,
}));

vi.mock('@/lib/supabase/env', () => ({
  publicEnv: {
    supabaseUrl: 'https://example.supabase.co',
    supabasePublishableKey: 'publishable-key',
  },
}));

beforeEach(() => {
  getUserMock.mockReset();
  createServerClientMock.mockReset().mockReturnValue({
    auth: { getUser: getUserMock },
  });
});

function req(path: string) {
  return new NextRequest(new Request(`http://localhost${path}`));
}

describe('updateSession', () => {
  it('does not resolve a user for a public path', async () => {
    const { updateSession } = await import('./middleware');
    const res = await updateSession(req('/'));
    expect(getUserMock).not.toHaveBeenCalled();
    expect(res.headers.get('location')).toBeNull();
  });

  it('does not resolve a user for the login page', async () => {
    const { updateSession } = await import('./middleware');
    const res = await updateSession(req('/login'));
    expect(getUserMock).not.toHaveBeenCalled();
    expect(res.headers.get('location')).toBeNull();
  });

  it('redirects /dashboard to /login when signed out', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const { updateSession } = await import('./middleware');
    const res = await updateSession(req('/dashboard'));
    expect(getUserMock).toHaveBeenCalled();
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/login');
  });

  it('passes /dashboard through when signed in', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const { updateSession } = await import('./middleware');
    const res = await updateSession(req('/dashboard'));
    expect(res.headers.get('location')).toBeNull();
  });

  it('resolves a user for /admin, same as /dashboard', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const { updateSession } = await import('./middleware');
    const res = await updateSession(req('/admin'));
    expect(getUserMock).toHaveBeenCalled();
    expect(res.headers.get('location')).toBeNull();
  });

  it('redirects /admin to /login when signed out, same as /dashboard', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const { updateSession } = await import('./middleware');
    const res = await updateSession(req('/admin'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/login');
  });

  it('resolves a user for nested /admin routes too', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const { updateSession } = await import('./middleware');
    await updateSession(req('/admin/vendors'));
    expect(getUserMock).toHaveBeenCalled();
  });

  it('degrades to unauthenticated and redirects when auth is unreachable', async () => {
    getUserMock.mockRejectedValue(new Error('network down'));
    const { updateSession } = await import('./middleware');
    const res = await updateSession(req('/admin'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/login');
  });
});

describe('updateSession: host-only duplicate auth cookie cleanup', () => {
  const withCookie = (path: string, cookie: string) =>
    new NextRequest(new Request(`http://localhost${path}`, { headers: { cookie } }));
  const cleared = (res: Response & { cookies: NextResponse['cookies'] }, name: string) =>
    res.cookies.getAll().find((c) => c.name === name);
  const DUPLICATED = 'sb-project-auth-token=host-only; sb-project-auth-token=domain';

  beforeEach(() => {
    process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN = '.merqo.io';
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN;
  });

  it('clears the host-only copy when the browser sends the same auth cookie twice', async () => {
    const { updateSession } = await import('./middleware');
    const res = await updateSession(withCookie('/dashboard', DUPLICATED));
    expect(cleared(res, 'sb-project-auth-token')?.maxAge).toBe(0);
  });

  it('clears on a public path too, where no user is resolved', async () => {
    const { updateSession } = await import('./middleware');
    const res = await updateSession(withCookie('/', DUPLICATED));
    expect(cleared(res, 'sb-project-auth-token')?.maxAge).toBe(0);
  });

  it('clears chunked token names', async () => {
    const { updateSession } = await import('./middleware');
    const res = await updateSession(
      withCookie(
        '/dashboard',
        'sb-project-auth-token.0=a; sb-project-auth-token.0=b; sb-project-auth-token.1=a; sb-project-auth-token.1=b'
      )
    );
    expect(cleared(res, 'sb-project-auth-token.0')?.maxAge).toBe(0);
    expect(cleared(res, 'sb-project-auth-token.1')?.maxAge).toBe(0);
  });

  it('clears again on every request while the duplicate exists', async () => {
    const { updateSession } = await import('./middleware');
    const first = await updateSession(withCookie('/dashboard', DUPLICATED));
    const second = await updateSession(withCookie('/dashboard', DUPLICATED));
    expect(cleared(first, 'sb-project-auth-token')?.maxAge).toBe(0);
    expect(cleared(second, 'sb-project-auth-token')?.maxAge).toBe(0);
  });

  it('leaves a single auth cookie alone', async () => {
    const { updateSession } = await import('./middleware');
    const res = await updateSession(withCookie('/dashboard', 'sb-project-auth-token=only-one'));
    expect(cleared(res, 'sb-project-auth-token')).toBeUndefined();
  });

  it('does nothing when NEXT_PUBLIC_AUTH_COOKIE_DOMAIN is unset', async () => {
    delete process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN;
    const { updateSession } = await import('./middleware');
    const res = await updateSession(withCookie('/dashboard', DUPLICATED));
    expect(cleared(res, 'sb-project-auth-token')).toBeUndefined();
  });

  it('does not clobber a same-request token refresh', async () => {
    createServerClientMock.mockImplementation((_url, _key, options) => ({
      auth: {
        getUser: vi.fn().mockImplementation(async () => {
          options.cookies.setAll([
            { name: 'sb-project-auth-token', value: 'freshly-refreshed', options: {} },
          ]);
          return { data: { user: { id: 'u1' } } };
        }),
      },
    }));
    const { updateSession } = await import('./middleware');
    const res = await updateSession(withCookie('/dashboard', DUPLICATED));
    expect(cleared(res, 'sb-project-auth-token')?.value).toBe('freshly-refreshed');
  });
});
