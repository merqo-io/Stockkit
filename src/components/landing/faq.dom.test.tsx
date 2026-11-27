// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Faq } from './faq';

describe('Faq', () => {
  it('renders exactly three rows', () => {
    const { container } = render(<Faq />);
    expect(container.querySelectorAll('[data-faq-row]')).toHaveLength(3);
    expect(screen.getByText('Does stockkit track sales automatically?')).toBeTruthy();
    expect(screen.getByText('What counts as a stock movement?')).toBeTruthy();
    expect(screen.getByText('What will it cost?')).toBeTruthy();
  });
});
