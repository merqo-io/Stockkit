// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { pathnameMock } = vi.hoisted(() => ({ pathnameMock: vi.fn(() => '/admin') }));
vi.mock('next/navigation', () => ({
  usePathname: () => pathnameMock(),
}));

import { AdminNav } from './admin-nav';

describe('AdminNav', () => {
  it.each([
    ['/admin', 'Overview', 'Vendors'],
    ['/admin/vendors', 'Vendors', 'Overview'],
    ['/admin/activity', 'Activity', 'Overview'],
  ])('highlights the tab for %s', (path, active, inactive) => {
    pathnameMock.mockReturnValue(path);
    render(<AdminNav />);

    expect(screen.getByRole('link', { name: active })).toHaveClass('text-primary');
    expect(screen.getByRole('link', { name: inactive })).not.toHaveClass('text-primary');
  });

  it('links each tab to its route', () => {
    render(<AdminNav />);

    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('href', '/admin');
    expect(screen.getByRole('link', { name: 'Vendors' })).toHaveAttribute('href', '/admin/vendors');
    expect(screen.getByRole('link', { name: 'Activity' })).toHaveAttribute(
      'href',
      '/admin/activity'
    );
  });
});
