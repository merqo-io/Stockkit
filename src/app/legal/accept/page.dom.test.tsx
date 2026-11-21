// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./actions', () => ({ acceptLegalTerms: vi.fn() }));
vi.mock('@/app/actions/auth', () => ({ signOutAction: vi.fn() }));

import LegalAcceptPage from './page';

async function renderPage(next?: string) {
  render(await LegalAcceptPage({ searchParams: Promise.resolve({ next }) }));
}

describe('LegalAcceptPage', () => {
  it('keeps submit disabled until the terms box is ticked, by touch', async () => {
    await renderPage();
    const user = userEvent.setup();
    const submit = screen.getByRole('button', { name: /continue/i });
    expect(submit.hasAttribute('disabled')).toBe(true);

    await user.pointer({ keys: '[TouchA]', target: screen.getByRole('checkbox') });
    expect(submit.hasAttribute('disabled')).toBe(false);
  });

  it('sanitises next and defaults to the dashboard', async () => {
    await renderPage('https://evil.example/x');
    const hidden = document.querySelector('input[name="next"]') as HTMLInputElement;
    expect(hidden.value).toBe('/dashboard');
  });

  it('keeps a sign-out exit', async () => {
    await renderPage();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeTruthy();
  });
});
