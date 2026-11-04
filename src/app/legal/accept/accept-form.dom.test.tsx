// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { replaceMock, refreshMock, signOutMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  refreshMock: vi.fn(),
  signOutMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock, refresh: refreshMock }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { signOut: signOutMock } }),
}));

vi.mock('./actions', () => ({ acceptLegalTerms: vi.fn() }));

vi.mock('@merqo/ui', () => ({
  TermsAcceptanceCheckbox: ({
    checked,
    onCheckedChange,
  }: {
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
  }) => (
    <input
      type="checkbox"
      aria-label="agree"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
    />
  ),
}));

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

import { toast } from 'sonner';
import { AcceptForm } from './accept-form';

beforeEach(() => {
  replaceMock.mockReset();
  refreshMock.mockReset();
  signOutMock.mockReset();
  vi.mocked(toast.error).mockReset();
});

describe('AcceptForm', () => {
  it('explains the disabled Continue button and hides the hint once ticked', async () => {
    render(<AcceptForm next="/dashboard" />);
    const button = screen.getByRole('button', { name: 'Continue' });
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.getAttribute('aria-describedby')).toBe('accept-hint');
    expect(screen.getByText('Tick the box to continue.')).toBeTruthy();

    await userEvent.click(screen.getByLabelText('agree'));
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.getAttribute('aria-describedby')).toBeNull();
    expect(screen.queryByText('Tick the box to continue.')).toBeNull();
  });

  it('signs out and sends the vendor to /login', async () => {
    signOutMock.mockResolvedValue({ error: null });
    render(<AcceptForm next="/dashboard" />);
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/login'));
    expect(refreshMock).toHaveBeenCalled();
  });

  it('toasts and stays put when sign out fails', async () => {
    signOutMock.mockResolvedValue({ error: { message: 'boom' } });
    render(<AcceptForm next="/dashboard" />);
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Could not sign out. Try again.'));
    expect(replaceMock).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Sign out' }).hasAttribute('disabled')).toBe(false);
  });
});
