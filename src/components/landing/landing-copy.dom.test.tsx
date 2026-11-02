// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SiteFooter } from '@/components/layout/site-footer';
import { Benefits } from './benefits';
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
      <Benefits />
      <Faq />
      <SiteFooter />
    </>
  );
}

describe('landing copy guardrails', () => {
  it('has no prices, em dashes or banned words', () => {
    const { container } = renderLanding();
    const text = container.textContent ?? '';
    expect(text).not.toContain('$');
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
    expect(ctas).toHaveLength(2);
    for (const cta of ctas) {
      expect(cta.getAttribute('href')).toBe('https://merqo.io/waitlist?kit=stockkit');
    }
    expect(screen.queryByRole('link', { name: 'Get started' })).toBeNull();
  });
});
