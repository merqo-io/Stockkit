// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageHeader } from './page-header';

describe('PageHeader', () => {
  it('renders the eyebrow, the title heading and the sentence', () => {
    render(
      <PageHeader eyebrow="Your account" title="Plan">
        You are on the Free plan.
      </PageHeader>
    );
    expect(screen.getByText('Your account')).toBeTruthy();
    const h1 = screen.getByRole('heading', { level: 1, name: 'Plan' });
    expect(h1.className).toContain('text-4xl');
    expect(h1.className).not.toContain('sm:text-4xl');
    expect(screen.getByText('You are on the Free plan.')).toBeTruthy();
  });

  it('omits the sentence when there are no children', () => {
    const { container } = render(<PageHeader eyebrow="Eyebrow" title="Title" />);
    expect(container.querySelectorAll('p')).toHaveLength(1);
  });

  it('steps the title down on small screens when responsive', () => {
    render(<PageHeader eyebrow="E" title="T" responsive />);
    expect(screen.getByRole('heading', { level: 1 }).className).toContain('text-3xl sm:text-4xl');
  });
});
