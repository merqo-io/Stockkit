// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FAQ_GROUPS, FAQ_INTRO, FAQ_TITLE } from './faq-content';
import FaqRoute, { metadata } from './page';

const ALL_ROWS = FAQ_GROUPS.flatMap((g) => g.rows);
const ALL_STRINGS = [
  FAQ_TITLE,
  FAQ_INTRO,
  ...FAQ_GROUPS.flatMap((g) => [g.heading ?? '', ...g.rows.flatMap((r) => [r.q, r.a])]),
];

describe('FaqRoute', () => {
  it('sets the page title', () => {
    expect(metadata).toEqual({ title: 'FAQ' });
  });

  it('renders the title, group headings and every question', () => {
    render(<FaqRoute />);
    expect(screen.getByRole('heading', { level: 1, name: FAQ_TITLE })).toBeInTheDocument();
    for (const heading of ['Getting started', 'Day to day', 'Cost, data and other kits']) {
      expect(screen.getByText(heading)).toBeInTheDocument();
    }
    expect(ALL_ROWS).toHaveLength(10);
    for (const row of ALL_ROWS) {
      expect(screen.getByText(row.q)).toBeInTheDocument();
    }
  });

  it('uses the settled sales answer and drops the shared sign-in sentence', () => {
    const sales = ALL_ROWS.find((r) => r.q === 'Does stockkit track sales automatically?');
    expect(sales?.a).toBe(
      'No. You log stock in and out by hand, and stockkit works out your stock value.'
    );
    const kits = ALL_ROWS.find((r) => r.q === 'Does stockkit connect to qkit or my other kits?');
    expect(kits?.a).not.toContain('sign-in');
  });

  it('has no closing line', () => {
    render(<FaqRoute />);
    expect(screen.queryByText(/legal@merqo\.io/)).not.toBeInTheDocument();
  });

  it('emits FAQ JSON-LD', () => {
    const { container } = render(<FaqRoute />);
    expect(container.querySelector('script[type="application/ld+json"]')).not.toBeNull();
  });

  it.each(ALL_STRINGS.map((s) => [s]))('keeps the copy guardrails: %s', (s) => {
    expect(s).not.toMatch(/[—$!]/);
    expect(s).not.toMatch(/\b(live|now available|proven|free plan|pro)\b/i);
  });
});
