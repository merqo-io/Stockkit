// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Loading from './loading';

describe('Mfa Loading', () => {
  it('announces itself as a polite status', () => {
    render(<Loading />);
    const status = screen.getByRole('status');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent).toContain('Loading…');
  });

  it('outlines the card and stops pulsing under reduced motion', () => {
    render(<Loading />);
    expect(screen.getByTestId('loading-card')).toBeTruthy();
    expect(screen.getByRole('status').className).toContain('motion-reduce:animate-none');
  });
});
