// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/app/actions/auth', () => ({ signOutAction: vi.fn() }));
vi.mock('@/app/actions/feedback', () => ({ submitFeedbackAction: vi.fn() }));
vi.mock('@/app/actions/support', () => ({ submitSupportMessageAction: vi.fn() }));

import { SiteFooter } from '@/components/layout/site-footer';
import { Closing } from './closing';
import { Faq, PRICING_LINE } from './faq';
import { Hero } from './hero';
import { HowItWorks } from './how-it-works';
import { Nav } from './nav';

const BANNED = [
  /\blive\b/i,
  /\bnow\b/i,
  /available today/i,
  /proven/i,
  /\btiers?\b/i,
  /shopkit/i,
  /reachkit/i,
];

function renderLanding() {
  return render(
    <>
      <Nav />
      <Hero />
      <HowItWorks />
      <Faq />
      <Closing />
      <SiteFooter />
    </>
  );
}

describe('landing copy guardrails', () => {
  it('has no prices, em dashes or banned words', () => {
    const { container } = renderLanding();
    const text = container.textContent ?? '';
    // The phone mock-ups show app strings such as "Unit cost ($)" and money
    // values; only copy outside them must stay free of prices.
    const prose = Array.from(container.querySelectorAll('[role="group"]')).reduce(
      (acc, el) => acc.replace(el.textContent ?? '', ''),
      text
    );
    expect(prose).not.toContain('$');
    expect(text).not.toContain('—');
    expect(text).not.toMatch(/\/month|\bPro\b|free plan/i);
    expect(text).not.toMatch(/own your data/i);
    for (const word of BANNED) expect(text).not.toMatch(word);
  });

  it('states readiness and the exact pricing line', () => {
    const { container } = renderLanding();
    expect(screen.getByText('In build')).toBeTruthy();
    expect(screen.getByText('Built, not yet tried with vendors.')).toBeTruthy();
    expect(PRICING_LINE).toBe(
      "Free during the pilot. If we start charging, you'll get at least 30 days' notice first."
    );
    expect(container.textContent).toContain(PRICING_LINE);
  });

  it('uses lowercase brand names in the footer', () => {
    render(<SiteFooter />);
    expect(screen.getByRole('link', { name: /stockkit home/ }).textContent).toBe('stockkit');
    expect(screen.queryByText('StockKit')).toBeNull();
  });

  it('sends every signup CTA to the waitlist', () => {
    renderLanding();
    const ctas = screen.getAllByRole('link', { name: 'Join the waitlist' });
    expect(ctas).toHaveLength(3);
    for (const cta of ctas) {
      expect(cta.getAttribute('href')).toBe('https://merqo.io/waitlist?kit=stockkit');
    }
    expect(screen.queryByRole('link', { name: 'Get started' })).toBeNull();
  });
});
