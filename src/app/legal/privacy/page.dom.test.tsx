// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import PrivacyPage, { metadata } from './page';

describe('PrivacyPage', () => {
  it('renders the privacy policy with the wordmark linked home', () => {
    render(<PrivacyPage />);

    expect(screen.getByRole('link', { name: /stockkit/i }).getAttribute('href')).toBe('/');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/privacy/i);
  });

  it('sets the shared tab title', () => {
    expect(metadata.title).toBe('Privacy Policy');
  });
});
