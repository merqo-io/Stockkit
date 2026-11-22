// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import TermsPage, { metadata } from './page';

describe('TermsPage', () => {
  it('renders the stockkit terms with the wordmark linked home', () => {
    render(<TermsPage />);

    expect(screen.getByRole('link', { name: /stockkit/i }).getAttribute('href')).toBe('/');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/terms/i);
  });

  it('sets the shared tab title', () => {
    expect(metadata.title).toBe('Terms of Service');
  });
});
