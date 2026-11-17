// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Nav } from './nav';

describe('Nav', () => {
  it('shows Sign in and Join the waitlist when signed out', () => {
    render(<Nav />);
    expect(screen.getByRole('link', { name: 'Sign in' }).getAttribute('href')).toBe('/login');
    expect(screen.getByRole('link', { name: 'Join the waitlist' }).getAttribute('href')).toBe(
      'https://merqo.io/waitlist?kit=stockkit'
    );
  });

  it('shows Dashboard when signed in', () => {
    render(<Nav authed />);
    expect(screen.getByRole('link', { name: 'Dashboard' }).getAttribute('href')).toBe('/dashboard');
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
