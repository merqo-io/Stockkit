// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { pushMock, refreshMock, signOutMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  signOutMock: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { signOut: signOutMock } }),
}));
vi.mock('@/app/actions/feedback', () => ({ submitFeedbackAction: vi.fn() }));
vi.mock('@/app/actions/support', () => ({ submitSupportMessageAction: vi.fn() }));

import { Nav } from './nav';

const vendor = { name: 'Ada Stall', avatarUrl: null };

beforeEach(() => {
  vi.clearAllMocks();
  signOutMock.mockResolvedValue({ error: null });
});

describe('Nav', () => {
  it('shows Sign in and Join the waitlist when signed out', () => {
    render(<Nav />);
    expect(screen.getByRole('link', { name: 'Sign in' }).getAttribute('href')).toBe('/login');
    expect(screen.getByRole('link', { name: 'Join the waitlist' }).getAttribute('href')).toBe(
      'https://merqo.io/waitlist?kit=stockkit'
    );
    expect(screen.queryByRole('button', { name: /account/i })).toBeNull();
  });

  it('shows Dashboard and the account menu when signed in', () => {
    render(<Nav authed vendor={vendor} />);
    expect(screen.getByRole('link', { name: 'Dashboard' }).getAttribute('href')).toBe('/dashboard');
    expect(screen.queryByRole('link', { name: 'Sign in' })).toBeNull();
    expect(screen.getByRole('button', { name: /Ada Stall|account/i })).toBeTruthy();
  });

  it('opens the account menu by touch and offers Sign out', async () => {
    const user = userEvent.setup();
    render(<Nav authed vendor={vendor} />);
    await user.pointer({
      keys: '[TouchA]',
      target: screen.getByRole('button', { name: /Ada Stall|account/i }),
    });
    expect(await screen.findByRole('menuitem', { name: /Sign out/i })).toBeTruthy();
  });

  it('signs out by touch, then goes to /login and refreshes', async () => {
    const user = userEvent.setup();
    render(<Nav authed vendor={vendor} />);
    await user.pointer({
      keys: '[TouchA]',
      target: screen.getByRole('button', { name: /Ada Stall|account/i }),
    });
    await user.pointer({
      keys: '[TouchA]',
      target: await screen.findByRole('menuitem', { name: /Sign out/i }),
    });
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/login'));
    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(refreshMock).toHaveBeenCalled();
  });

  it('does not navigate when sign out fails', async () => {
    signOutMock.mockResolvedValue({ error: { message: 'network down' } });
    const user = userEvent.setup();
    render(<Nav authed vendor={vendor} />);
    await user.pointer({
      keys: '[TouchA]',
      target: screen.getByRole('button', { name: /Ada Stall|account/i }),
    });
    await user.pointer({
      keys: '[TouchA]',
      target: await screen.findByRole('menuitem', { name: /Sign out/i }),
    });
    expect(await screen.findByText(/network down/i)).toBeTruthy();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('links to the About page', () => {
    render(<Nav />);
    expect(screen.getByRole('link', { name: 'About' }).getAttribute('href')).toBe('/about');
  });

  it('links to the FAQ page and keeps the link visible at every width', () => {
    render(<Nav />);
    const link = screen.getByRole('link', { name: 'FAQ' });
    expect(link.getAttribute('href')).toBe('/faq');
    expect(link.className).not.toContain('hidden');
  });
});
