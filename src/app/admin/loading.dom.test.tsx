// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Loading from './loading';

describe('Admin Loading', () => {
  it('announces itself as a status', () => {
    render(<Loading />);
    expect(screen.getByRole('status').textContent).toContain('Loading…');
  });

  it('outlines tiles and rows with the shared skeletons', () => {
    render(<Loading />);
    expect(screen.getByTestId('loading-tiles').children).toHaveLength(6);
    expect(screen.getByRole('status').querySelector('[data-slot="skeleton"]')).toBeTruthy();
  });
});
