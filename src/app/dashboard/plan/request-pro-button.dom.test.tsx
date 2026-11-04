// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { submitMock } = vi.hoisted(() => ({ submitMock: vi.fn() }));

vi.mock('@/app/actions/support', () => ({ submitSupportMessageAction: submitMock }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { toast } from 'sonner';
import { RequestProButton } from './request-pro-button';

beforeEach(() => {
  submitMock.mockReset();
  vi.mocked(toast.success).mockReset();
  vi.mocked(toast.error).mockReset();
});

describe('RequestProButton', () => {
  it('sends the request, toasts and disables the button', async () => {
    submitMock.mockResolvedValue({ success: true });
    render(<RequestProButton />);
    await userEvent.click(screen.getByRole('button', { name: 'Request Pro' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Request sent' })).toBeTruthy());
    expect(submitMock).toHaveBeenCalledWith({
      category: 'account',
      body: 'Please upgrade my stockkit account to Pro.',
    });
    expect(toast.success).toHaveBeenCalledWith("Request sent. We'll email you when Pro is on.");
    expect(screen.getByRole('button', { name: 'Request sent' }).hasAttribute('disabled')).toBe(
      true
    );
  });

  it('toasts an error and stays retryable on failure', async () => {
    submitMock.mockResolvedValue({ success: false, error: 'nope' });
    render(<RequestProButton />);
    await userEvent.click(screen.getByRole('button', { name: 'Request Pro' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Could not send your request. Try again.')
    );
    expect(screen.getByRole('button', { name: 'Request Pro' }).hasAttribute('disabled')).toBe(
      false
    );
    expect(screen.getByText("We'll upgrade your account by hand and email you.")).toBeTruthy();
  });
});
