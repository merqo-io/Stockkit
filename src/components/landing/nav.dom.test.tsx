// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { signOut: vi.fn().mockResolvedValue({ error: null }) } }),
}));
vi.mock('@/app/actions/feedback', () => ({ submitFeedbackAction: vi.fn() }));
vi.mock('@/app/actions/support', () => ({ submitSupportMessageAction: vi.fn() }));

import { Nav } from './nav';

const vendor = { name: 'Ada Stall', avatarUrl: null };

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
