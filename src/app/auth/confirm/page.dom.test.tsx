// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { createServerClientMock } = vi.hoisted(() => ({ createServerClientMock: vi.fn() }));

vi.mock('@/lib/supabase/server', () => ({ createServerClient: createServerClientMock }));

import AuthConfirmPage, { metadata } from './page';

async function renderPage(searchParams: Record<string, string | string[] | undefined>) {
  render(await AuthConfirmPage({ searchParams: Promise.resolve(searchParams) }));
}

describe('/auth/confirm page', () => {
  it('renders the continue form for a valid link without calling Supabase', async () => {
    await renderPage({ token_hash: 'th', type: 'recovery' });
    expect(screen.getByRole('button')).toBeTruthy();
    const form = document.querySelector('form') as HTMLFormElement;
    expect(form.getAttribute('method')?.toLowerCase()).toBe('post');
    expect(form.getAttribute('action')).toBe('/auth/confirm/verify');
    expect(createServerClientMock).not.toHaveBeenCalled();
  });

  it('renders the invalid state when the link has no token', async () => {
    await renderPage({});
    expect(screen.getByText(/invalid or has expired/i)).toBeTruthy();
    expect(document.querySelector('form')).toBeNull();
    expect(createServerClientMock).not.toHaveBeenCalled();
  });

  it('is noindex and sends no referrer', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.referrer).toBe('no-referrer');
  });
});
