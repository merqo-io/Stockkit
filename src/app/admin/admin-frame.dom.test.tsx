// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const { pathnameMock } = vi.hoisted(() => ({ pathnameMock: vi.fn(() => '/admin') }));
vi.mock('next/navigation', () => ({
  usePathname: () => pathnameMock(),
}));

import { AdminFrame } from './admin-frame';

function renderFrame() {
  return render(
    <AdminFrame actions={<button type="button">Sign out</button>}>
      <p>page body</p>
    </AdminFrame>
  );
}

describe('AdminFrame', () => {
  it.each([
    ['/admin', 'Overview', 'Vendors'],
    ['/admin/vendors', 'Vendors', 'Overview'],
    ['/admin/activity', 'Activity', 'Overview'],
  ])('marks the tab for %s as current', (path, active, inactive) => {
    pathnameMock.mockReturnValue(path);
    renderFrame();

    expect(screen.getByRole('link', { name: active })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: inactive })).not.toHaveAttribute('aria-current');
  });

  it('links each tab to its route and back to the dashboard', () => {
    renderFrame();

    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('href', '/admin');
    expect(screen.getByRole('link', { name: 'Vendors' })).toHaveAttribute('href', '/admin/vendors');
    expect(screen.getByRole('link', { name: 'Activity' })).toHaveAttribute(
      'href',
      '/admin/activity'
    );
    expect(screen.getByRole('link', { name: 'Back to dashboard' })).toHaveAttribute(
      'href',
      '/dashboard'
    );
  });

  it('renders the Admin badge, the actions and the page body', () => {
    renderFrame();

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
    expect(screen.getByText('page body')).toBeInTheDocument();
  });

  it('lets a touch tap reach a tab link', async () => {
    const user = userEvent.setup();
    renderFrame();
    const vendors = screen.getByRole('link', { name: 'Vendors' });
    vendors.addEventListener('click', (e) => e.preventDefault());

    await user.pointer({ keys: '[TouchA]', target: vendors });

    expect(vendors).toHaveAttribute('href', '/admin/vendors');
  });
});
