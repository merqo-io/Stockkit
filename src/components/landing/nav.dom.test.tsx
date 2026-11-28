// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { signOutMock } = vi.hoisted(() => ({ signOutMock: vi.fn() }));
vi.mock('@/app/actions/auth', () => ({ signOutAction: signOutMock }));
vi.mock('@/app/actions/feedback', () => ({ submitFeedbackAction: vi.fn() }));
vi.mock('@/app/actions/support', () => ({ submitLandingSupportAction: vi.fn() }));

import { Nav } from './nav';

const navUser = { name: 'Ada Stall', email: 'ada@b.co' };

beforeEach(() => {
  vi.clearAllMocks();
  signOutMock.mockResolvedValue(undefined);
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

  it('keeps the signed-out actions at least 44px tall', () => {
    render(<Nav />);
    for (const name of ['Sign in', 'Join the waitlist']) {
      expect(screen.getByRole('link', { name }).className).toContain('min-h-11');
    }
  });

  it('shows Dashboard and the account menu when signed in', () => {
    render(<Nav user={navUser} />);
    expect(screen.getByRole('link', { name: 'Dashboard' }).getAttribute('href')).toBe('/dashboard');
    expect(screen.queryByRole('link', { name: 'Sign in' })).toBeNull();
    expect(screen.getByRole('button', { name: /Ada Stall|account/i })).toBeTruthy();
  });

  it('opens the account menu by touch and offers Sign out', async () => {
    const user = userEvent.setup();
    render(<Nav user={navUser} />);
    await user.pointer({
      keys: '[TouchA]',
      target: screen.getByRole('button', { name: /Ada Stall|account/i }),
    });
    expect(await screen.findByRole('menuitem', { name: /Sign out/i })).toBeTruthy();
  });

  it('signs out through the shared server action by touch', async () => {
    const user = userEvent.setup();
    render(<Nav user={navUser} />);
    await user.pointer({
      keys: '[TouchA]',
      target: screen.getByRole('button', { name: /Ada Stall|account/i }),
    });
    await user.pointer({
      keys: '[TouchA]',
      target: await screen.findByRole('menuitem', { name: /Sign out/i }),
    });
    await waitFor(() => expect(signOutMock).toHaveBeenCalledTimes(1));
  });

  it('shows the error when sign out rejects', async () => {
    signOutMock.mockRejectedValue(new Error('network down'));
    const user = userEvent.setup();
    render(<Nav user={navUser} />);
    await user.pointer({
      keys: '[TouchA]',
      target: screen.getByRole('button', { name: /Ada Stall|account/i }),
    });
    await user.pointer({
      keys: '[TouchA]',
      target: await screen.findByRole('menuitem', { name: /Sign out/i }),
    });
    expect(await screen.findByText(/network down/i)).toBeTruthy();
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
