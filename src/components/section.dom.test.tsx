// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Section } from './section';

describe('Section', () => {
  it('renders inside a flat bordered shell with no shadow', () => {
    const { container } = render(
      <Section icon={<span />} title="Business name" description="desc">
        <p>content</p>
      </Section>
    );
    const shell = container.querySelector('section.rounded-2xl');
    expect(shell).not.toBeNull();
    expect(shell?.className).not.toMatch(/shadow/);
  });

  it('renders the icon, title, and description via the shared Section header', () => {
    render(
      <Section icon={<span data-testid="my-icon" />} title="Stall name" description="desc">
        <p>content</p>
      </Section>
    );
    expect(screen.getByTestId('my-icon')).toBeTruthy();
    expect(screen.getByText('Stall name')).toBeTruthy();
    expect(screen.getByText('desc')).toBeTruthy();
  });

  it('renders an eyebrow when given one', () => {
    render(
      <Section icon={<span />} eyebrow="Shown to customers" title="Stall name" description="desc">
        <p>content</p>
      </Section>
    );
    expect(screen.getByText('Shown to customers')).toBeTruthy();
  });

  it('renders children inside the shell', () => {
    render(
      <Section icon={<span />} title="Stall name" description="desc">
        <p>field content</p>
      </Section>
    );
    expect(screen.getByText('field content')).toBeTruthy();
  });
});
