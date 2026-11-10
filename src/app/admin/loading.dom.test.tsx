// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Loading from './loading';

describe('Admin Loading', () => {
  it('announces itself as a polite status', () => {
    render(<Loading />);
    const status = screen.getByRole('status');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent).toContain('Loading…');
  });

  it('outlines tiles and rows and stops pulsing under reduced motion', () => {
    render(<Loading />);
    expect(screen.getAllByTestId('loading-tile')).toHaveLength(6);
    expect(screen.getAllByTestId('loading-row').length).toBeGreaterThan(0);
    expect(screen.getByRole('status').className).toContain('motion-reduce:animate-none');
  });
});
