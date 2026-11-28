// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Loading from './loading';

describe('Loading', () => {
  it('announces itself as a status', () => {
    render(<Loading />);
    expect(screen.getByRole('status').textContent).toContain('Loading…');
  });

  it('renders a page-shaped skeleton without a spinner', () => {
    const { container } = render(<Loading />);
    expect(screen.getByTestId('loading-tiles').children).toHaveLength(3);
    expect(screen.getByRole('status').querySelector('[data-slot="skeleton"]')).toBeTruthy();
    expect(container.querySelector('.animate-spin')).toBeNull();
  });
});
