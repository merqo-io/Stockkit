// @vitest-environment jsdom
import { act, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Benefits } from './benefits';
import { Faq } from './faq';
import { Hero } from './hero';
import { HowItWorks } from './how-it-works';
import { LedgerCardPreview } from './ledger-card-preview';

const SURFACES: Array<[string, () => ReactElement]> = [
  ['Hero', () => <Hero />],
  ['Benefits', () => <Benefits />],
  ['HowItWorks', () => <HowItWorks />],
  ['LedgerCardPreview', () => <LedgerCardPreview />],
  ['Faq', () => <Faq />],
];

function classText(container: HTMLElement) {
  return Array.from(container.querySelectorAll('[class]'))
    .map((el) => el.getAttribute('class'))
    .join(' ');
}

describe('landing follows the public page rules', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(SURFACES)(
    '%s has no shadow, oversized radius, entrance animation or hover lift',
    (_name, ui) => {
      const { container } = render(ui());
      const classes = classText(container);
      expect(classes).not.toMatch(/(^|[\s:])shadow-/);
      expect(classes).not.toMatch(/rounded-(2xl|xl|3xl)/);
      expect(classes).not.toContain('fade-rise');
      expect(classes).not.toMatch(/hover:-?translate|hover:scale/);
    }
  );

  it('step cards are bordered surfaces', () => {
    const { container } = render(<HowItWorks />);
    const headings = container.querySelectorAll('h3');
    expect(headings).toHaveLength(3);
    headings.forEach((h) => {
      const card = h.parentElement as HTMLElement;
      expect(card.className).toContain('rounded-lg');
      expect(card.className).toContain('border');
    });
  });

  it('ledger rows do not change as time passes', () => {
    vi.useFakeTimers();
    const { container } = render(<LedgerCardPreview />);
    const before = container.innerHTML;
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(container.innerHTML).toBe(before);
  });
});
