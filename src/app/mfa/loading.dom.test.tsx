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

  it('outlines the card with shared skeletons', () => {
    render(<Loading />);
    expect(screen.getByTestId('loading-card').querySelector('[data-slot="skeleton"]')).toBeTruthy();
  });
});
