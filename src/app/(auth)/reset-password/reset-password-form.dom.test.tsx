// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { routerPush, routerRefresh, getUserMock, updateUserMock } = vi.hoisted(() => ({
  routerPush: vi.fn(),
  routerRefresh: vi.fn(),
  getUserMock: vi.fn(),
  updateUserMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush, refresh: routerRefresh }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { getUser: getUserMock, updateUser: updateUserMock } }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { ResetPasswordForm } from './reset-password-form';

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateUserMock.mockResolvedValue({ error: null });
  });

  it('shows the expired-link state when there is no recovery session', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    render(<ResetPasswordForm />);
    expect(await screen.findByText('This link has expired')).toBeTruthy();
  });

  it('shows the password form when a recovery session exists', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    render(<ResetPasswordForm />);
    expect(await screen.findByLabelText('New password')).toBeTruthy();
  });

  it('shows an error and does not call updateUser when passwords do not match', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const user = userEvent.setup();
    render(<ResetPasswordForm />);
    await screen.findByLabelText('New password');
    await user.type(screen.getByLabelText('New password'), 'hunter22');
    await user.type(screen.getByLabelText('Confirm new password'), 'different');
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    expect(await screen.findByText('Passwords do not match.')).toBeTruthy();
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it('updates the password and redirects to dashboard on success', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const user = userEvent.setup();
    render(<ResetPasswordForm />);
    await screen.findByLabelText('New password');
    await user.type(screen.getByLabelText('New password'), 'hunter22');
    await user.type(screen.getByLabelText('Confirm new password'), 'hunter22');
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    await waitFor(() => expect(updateUserMock).toHaveBeenCalledWith({ password: 'hunter22' }));
    expect(routerPush).toHaveBeenCalledWith('/dashboard');
    expect(routerRefresh).toHaveBeenCalled();
  });

  it('shows the update error inline with role="alert" and keeps the form usable', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    updateUserMock.mockResolvedValue({ error: { message: 'boom', status: 500 } });
    const user = userEvent.setup();
    render(<ResetPasswordForm />);
    await screen.findByLabelText('New password');
    await user.type(screen.getByLabelText('New password'), 'hunter22');
    await user.type(screen.getByLabelText('Confirm new password'), 'hunter22');
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(routerPush).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Update password' })).toHaveProperty(
      'disabled',
      false
    );
  });

  it('keeps the submit button pending after success until the redirect lands', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const user = userEvent.setup();
    render(<ResetPasswordForm />);
    await screen.findByLabelText('New password');
    await user.type(screen.getByLabelText('New password'), 'hunter22');
    await user.type(screen.getByLabelText('Confirm new password'), 'hunter22');
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    await waitFor(() => expect(routerPush).toHaveBeenCalledWith('/dashboard'));
    const button = screen.getByRole('button', { name: /Updating/ });
    expect(button).toHaveProperty('disabled', true);
  });

  it('shows the password requirements hint trigger next to the new-password label', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    render(<ResetPasswordForm />);
    await screen.findByLabelText('New password');
    expect(screen.getByRole('button', { name: 'Password requirements' })).toBeTruthy();
  });

  it('shows a specific inline error when updateUser rejects a weak password', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    updateUserMock.mockResolvedValueOnce({
      error: {
        code: 'weak_password',
        status: 422,
        reasons: ['length'],
        message: 'Password should be at least 10 characters.',
      },
    });
    const user = userEvent.setup();
    render(<ResetPasswordForm />);
    await screen.findByLabelText('New password');
    await user.type(screen.getByLabelText('New password'), 'hunter22');
    await user.type(screen.getByLabelText('Confirm new password'), 'hunter22');
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    expect(
      await screen.findByText('Password is too short. Use at least 10 characters.')
    ).toBeTruthy();
    expect(routerPush).not.toHaveBeenCalled();
  });

  it('shows the fallback error when updateUser throws instead of returning an error', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } } });
    updateUserMock.mockRejectedValueOnce(new Error('network down'));
    const user = userEvent.setup();
    render(<ResetPasswordForm />);
    await screen.findByLabelText('New password');
    await user.type(screen.getByLabelText('New password'), 'hunter22');
    await user.type(screen.getByLabelText('Confirm new password'), 'hunter22');
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    expect(await screen.findByText('Could not update your password. Try again.')).toBeTruthy();
    expect(routerPush).not.toHaveBeenCalled();
  });
});

it.each(['returned', 'rejected'])(
  'recovers from %s session lookup failures without claiming expiry',
  async (kind) => {
    if (kind === 'returned')
      getUserMock.mockResolvedValueOnce({ data: { user: null }, error: { message: 'offline' } });
    else getUserMock.mockRejectedValueOnce(new Error('offline'));
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    render(<ResetPasswordForm />);
    expect(await screen.findByText('Could not check your reset link')).toBeTruthy();
    expect(screen.queryByText('This link has expired')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByLabelText('New password')).toBeInTheDocument();
  }
);
