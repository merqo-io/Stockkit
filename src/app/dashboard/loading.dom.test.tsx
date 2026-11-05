// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Loading from './loading';

describe('Loading', () => {
  it('announces itself as a polite status', () => {
    render(<Loading />);
    const status = screen.getByRole('status');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent).toContain('Loading…');
  });

  it('renders a page-shaped skeleton that stops pulsing under reduced motion', () => {
    const { container } = render(<Loading />);
    expect(screen.getAllByTestId('loading-tile')).toHaveLength(3);
    expect(screen.getAllByTestId('loading-row').length).toBeGreaterThan(0);
    const status = screen.getByRole('status');
    expect(status.className).toContain('animate-pulse');
    expect(status.className).toContain('motion-reduce:animate-none');
    expect(container.querySelector('.animate-spin')).toBeNull();
  });
});
