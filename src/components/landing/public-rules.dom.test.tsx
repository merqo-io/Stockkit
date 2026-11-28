// @vitest-environment jsdom
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { Closing } from './closing';
import { Faq } from './faq';
import { Hero } from './hero';
import { HowItWorks } from './how-it-works';

const SURFACES: Array<[string, () => ReactElement]> = [
  ['Hero', () => <Hero />],
  ['Closing', () => <Closing />],
  ['HowItWorks', () => <HowItWorks />],
  ['Faq', () => <Faq />],
];

function classText(container: HTMLElement, selector = '[class]') {
  return Array.from(container.querySelectorAll(selector))
    .map((el) => el.getAttribute('class'))
    .join(' ');
}

describe('landing follows the public page rules', () => {
  it.each(SURFACES)(
    '%s has no shadow, oversized radius, entrance animation or hover lift',
    (_name, ui) => {
      const { container } = render(ui());
      const classes = classText(container);
      // The shared Button's outline variant carries a hairline shadow-xs that
      // is part of the kit primitive, so buttons are exempt from the shadow rule.
      const nonButtonClasses = classText(container, '[class]:not([data-slot="button"])');
      expect(nonButtonClasses).not.toMatch(/(^|[\s:])shadow-/);
      // PhoneFrame keeps rounded-3xl: a product object keeps its real edge.
      expect(classes).not.toMatch(/rounded-(2xl|xl)/);
      expect(classes).not.toContain('fade-rise');
      expect(classes).not.toMatch(/hover:-?translate|hover:scale/);
    }
  );
});
