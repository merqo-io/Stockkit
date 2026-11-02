// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Benefits } from './benefits';
import { Faq } from './faq';
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
    for (const word of BANNED) expect(text).not.toMatch(word);
  });

  it('states readiness and the exact pricing line', () => {
    const { container } = renderLanding();
    expect(screen.getByText('In build')).toBeTruthy();
    expect(screen.getByText('Built, not yet tried with vendors.')).toBeTruthy();
    expect(container.textContent).toContain(
      "Free during the pilot. If we start charging, you'll get at least 30 days' notice first."
    );
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
