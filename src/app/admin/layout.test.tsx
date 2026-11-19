import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAdminMock, signOutMock, createServerClientMock, redirectMock } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  signOutMock: vi.fn(async () => ({ error: null })),
  createServerClientMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock('@/lib/admin', () => ({ requireAdmin: requireAdminMock }));
vi.mock('@/lib/supabase/server', () => ({ createServerClient: createServerClientMock }));
vi.mock('next/navigation', () => ({ redirect: redirectMock }));
vi.mock('@/app/admin/admin-frame', () => ({ AdminFrame: () => null }));

beforeEach(() => {
  requireAdminMock.mockReset().mockResolvedValue({ user: { id: 'admin-1' } });
  createServerClientMock.mockReset().mockResolvedValue({ auth: { signOut: signOutMock } });
  redirectMock.mockReset();
  signOutMock.mockReset().mockResolvedValue({ error: null });
});

type Element = { type: unknown; props: Record<string, unknown> };

describe('AdminLayout', () => {
  it('gates the route via requireAdmin before rendering anything', async () => {
    const { default: AdminLayout } = await import('./layout');
    await AdminLayout({ children: null });
    expect(requireAdminMock).toHaveBeenCalled();
  });

  it('wraps children in the admin frame', async () => {
    const { default: AdminLayout } = await import('./layout');
    const { AdminFrame } = await import('@/app/admin/admin-frame');
    const element = (await AdminLayout({ children: 'page-content' })) as Element;

    expect(element.type).toBe(AdminFrame);
    expect(element.props.children).toBe('page-content');
  });

  it('passes a sign-out form whose action signs the user out and redirects to /login', async () => {
    const { default: AdminLayout } = await import('./layout');
    const element = (await AdminLayout({ children: null })) as Element;

    const signOutForm = element.props.actions as Element;
    expect(signOutForm.type).toBe('form');
    const action = signOutForm.props.action as () => Promise<void>;
    await action();

    expect(signOutMock).toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith('/login');
  });
});
