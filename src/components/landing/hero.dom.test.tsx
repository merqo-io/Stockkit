// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Hero } from './hero';

describe('Hero', () => {
  it('states what the app really does', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'See what your stock is worth, and what is running low.'
    );
  });

  it('frames the overview mock-up in a phone', () => {
    render(<Hero />);
    const phone = screen.getByRole('group', { name: 'Overview screen' });
    expect(phone.textContent).toContain('Inventory value');
    expect(phone.textContent).toContain('Needs attention');
  });

  it('links Join the waitlist to the waitlist when signed out', () => {
    render(<Hero />);
    const cta = screen.getByRole('link', { name: 'Join the waitlist' });
    expect(cta.getAttribute('href')).toBe('https://merqo.io/waitlist?kit=stockkit');
  });

  it('links to the dashboard when signed in', () => {
    render(<Hero authed />);
    const cta = screen.getByRole('link', { name: 'Go to dashboard' });
    expect(cta.getAttribute('href')).toBe('/dashboard');
  });
});
