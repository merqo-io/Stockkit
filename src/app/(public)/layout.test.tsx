import { beforeEach, describe, expect, it, vi } from 'vitest';

import PublicLayout from './layout';

const { getUserMock, maybeSingleMock, createServerClientMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  maybeSingleMock: vi.fn(),
  createServerClientMock: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({ createServerClient: createServerClientMock }));
vi.mock('@/components/landing/nav', () => ({ Nav: () => null }));
vi.mock('@/components/layout', () => ({ SiteFooter: () => null }));
vi.mock('@merqo/ui', async (orig) => ({
  ...(await orig<typeof import('@merqo/ui')>()),
  BackToTop: () => null,
}));

beforeEach(() => {
  vi.clearAllMocks();
  createServerClientMock.mockResolvedValue({
    auth: { getUser: getUserMock },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: maybeSingleMock }) }) }),
  });
});

// The layout returns a React element tree; Nav is the first child of the root div.
async function navProps() {
  const tree = await PublicLayout({ children: null });
  const [nav] = tree.props.children as { props: { user: unknown } }[];
  return nav.props;
}

describe('PublicLayout account resolution', () => {
  it('passes no user when signed out', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    expect((await navProps()).user).toBeNull();
    expect(maybeSingleMock).not.toHaveBeenCalled();
  });

  it('uses the vendors.name and an https avatar when signed in', async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'u1', email: 'a@b.co', user_metadata: { avatar_url: 'https://x/y.png' } },
      },
    });
    maybeSingleMock.mockResolvedValue({ data: { name: 'Ada Stall' } });
    expect((await navProps()).user).toEqual({
      name: 'Ada Stall',
      email: 'a@b.co',
      avatarUrl: 'https://x/y.png',
    });
  });

  it('falls back to the email prefix, then Account, and drops a non-string avatar', async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: 'u1', email: 'ada@b.co', user_metadata: { avatar_url: 5 } } },
    });
    maybeSingleMock.mockResolvedValue({ data: null });
    expect(await navProps()).toMatchObject({ user: { name: 'ada' } });

    getUserMock.mockResolvedValue({ data: { user: { id: 'u2', user_metadata: {} } } });
    expect(await navProps()).toMatchObject({ user: { name: 'Account' } });
  });
});
