// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { HowItWorks } from './how-it-works';

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

describe('HowItWorks', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the three journey steps in order, with no card grid', () => {
    const { container } = render(<HowItWorks />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual([
      'Add a product and what you have.',
      'Log a restock when stock arrives.',
      'See what is running low.',
    ]);
    expect(container.querySelector('.sm\:grid-cols-3')).toBeNull();
  });

  it('the restock press works by touch and Replay hands the button back', async () => {
    stubReducedMotion(false);
    const user = userEvent.setup();
    render(<HowItWorks />);
    const press = screen.getByRole('button', { name: 'Log restock of 12 L' });
    await user.pointer({ keys: '[TouchA]', target: press });
    expect(screen.getByText('Restock logged')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Replay' }));
    expect(screen.queryByText('Restock logged')).toBeNull();
    expect(screen.getByRole('button', { name: 'Log restock of 12 L' })).toBeTruthy();
  });

  it('shows every step complete under reduced motion', () => {
    stubReducedMotion(true);
    render(<HowItWorks />);
    expect(screen.getByText('Restock logged')).toBeTruthy();
    expect(screen.getByText('Needs attention')).toBeTruthy();
    expect(
      screen.getByText((_, el) => el?.tagName === 'P' && el.textContent === 'Low at 6 L')
    ).toBeTruthy();
  });
});
