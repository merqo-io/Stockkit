// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ActionResult } from '@merqo/ui/kit-api';

type UndoOptions = {
  message: string;
  onUndo: () => void;
  onSettle?: (reason: 'undone' | 'expired' | 'dismissed') => void | Promise<void>;
};

const { saveProductMock, archiveProductMock, undoToastMock } = vi.hoisted(() => ({
  undoToastMock: vi.fn<(options: UndoOptions) => void>(),
  saveProductMock: vi.fn(async (): Promise<ActionResult<{ productId: string }>> => ({
    success: true,
    productId: 'p1',
  })),
  archiveProductMock: vi.fn(async (): Promise<ActionResult> => ({ success: true })),
}));
vi.mock('./actions', () => ({
  saveProduct: saveProductMock,
  archiveProduct: archiveProductMock,
}));

vi.mock('@merqo/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@merqo/ui')>()),
  undoToast: undoToastMock,
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from 'sonner';

import { ProductForm } from './product-form';

const product = {
  id: 'p1',
  vendor_id: 'v1',
  name: 'Chicken thigh',
  unit: 'kg',
  unit_cost_cents: 500,
  on_hand: 10,
  low_stock_threshold: 2,
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

afterEach(() => {
  undoToastMock.mockReset();
  vi.mocked(toast.error).mockClear();
  saveProductMock.mockReset();
  saveProductMock.mockResolvedValue({ success: true, productId: 'p1' });
  archiveProductMock.mockReset();
  archiveProductMock.mockResolvedValue({ success: true });
});

describe('ProductForm', () => {
  it('keeps the last valid unit cost when the field holds an unparseable amount', async () => {
    const user = userEvent.setup();
    render(<ProductForm onSaved={vi.fn()} />);

    await user.type(screen.getByLabelText(/^name$/i), 'Chicken thigh');
    const costInput = screen.getByLabelText<HTMLInputElement>(/unit cost/i);
    await user.clear(costInput);
    await user.type(costInput, '7.5x');
    await user.click(screen.getByRole('button', { name: /add product/i }));

    expect(costInput.value).toBe('7.50');
    expect(saveProductMock).toHaveBeenCalledWith(expect.objectContaining({ unit_cost_cents: 750 }));
  });

  it('saves a cleared unit cost as zero', async () => {
    const user = userEvent.setup();
    render(<ProductForm onSaved={vi.fn()} />);

    await user.type(screen.getByLabelText(/^name$/i), 'Chicken thigh');
    await user.clear(screen.getByLabelText(/unit cost/i));
    await user.click(screen.getByRole('button', { name: /add product/i }));

    expect(saveProductMock).toHaveBeenCalledWith(expect.objectContaining({ unit_cost_cents: 0 }));
  });

  it('explains the low-stock threshold in a tap tooltip', async () => {
    const user = userEvent.setup();
    render(<ProductForm onSaved={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /about low-stock threshold/i }));

    expect(await screen.findByText(/shows as low stock once its quantity drops/i)).toBeTruthy();
  });

  it('saves a new product and reports it to onSaved', async () => {
    const onSaved = vi.fn();
    const user = userEvent.setup();
    render(<ProductForm onSaved={onSaved} />);

    await user.type(screen.getByLabelText(/^name$/i), 'Chicken thigh');
    await user.click(screen.getByRole('button', { name: /add product/i }));

    expect(saveProductMock).toHaveBeenCalled();
    expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ name: 'Chicken thigh' }));
  });

  it('shows a toast when saving returns a failure', async () => {
    saveProductMock.mockResolvedValueOnce({ success: false, error: 'Server error' });
    const user = userEvent.setup();
    render(<ProductForm onSaved={vi.fn()} />);

    await user.type(screen.getByLabelText(/^name$/i), 'Chicken thigh');
    await user.click(screen.getByRole('button', { name: /add product/i }));

    expect(toast.error).toHaveBeenCalledWith('Server error');
  });

  it('shows a generic toast when saving throws instead of returning an error', async () => {
    saveProductMock.mockRejectedValueOnce(new Error('network down'));
    const user = userEvent.setup();
    render(<ProductForm onSaved={vi.fn()} />);

    await user.type(screen.getByLabelText(/^name$/i), 'Chicken thigh');
    await user.click(screen.getByRole('button', { name: /add product/i }));

    expect(toast.error).toHaveBeenCalledWith('Could not save the product. Try again.');
  });

  async function archive(onSaved = vi.fn()) {
    const user = userEvent.setup();
    render(<ProductForm product={product} onSaved={onSaved} />);
    await user.pointer({
      keys: '[TouchA]',
      target: screen.getByRole('button', { name: /archive product/i }),
    });
    expect(undoToastMock).toHaveBeenCalledTimes(1);
    return { onSaved, options: undoToastMock.mock.calls[0]![0] };
  }

  it('archives at once with an undo toast and commits nothing until it settles', async () => {
    const { onSaved, options } = await archive();

    expect(options.message).toBe('Product archived');
    expect(onSaved).toHaveBeenCalledWith({ ...product, is_active: false });
    expect(archiveProductMock).not.toHaveBeenCalled();
  });

  it('Undo restores the product without calling archiveProduct', async () => {
    const { onSaved, options } = await archive();
    onSaved.mockClear();

    options.onUndo();
    await options.onSettle?.('undone');

    expect(onSaved).toHaveBeenCalledWith(product);
    expect(archiveProductMock).not.toHaveBeenCalled();
  });

  it.each(['expired', 'dismissed'] as const)(
    'commits archiveProduct once when the toast is %s',
    async (reason) => {
      const { options } = await archive();

      await options.onSettle?.(reason);

      expect(archiveProductMock).toHaveBeenCalledTimes(1);
      expect(archiveProductMock).toHaveBeenCalledWith('p1');
      expect(toast.error).not.toHaveBeenCalled();
    }
  );

  it('rolls the product back and toasts when the commit returns a failure', async () => {
    archiveProductMock.mockResolvedValueOnce({ success: false, error: 'Cannot archive' });
    const { onSaved, options } = await archive();
    onSaved.mockClear();

    await options.onSettle?.('expired');

    expect(toast.error).toHaveBeenCalledWith('Cannot archive');
    expect(onSaved).toHaveBeenCalledWith(product);
  });

  it('rolls the product back with a generic toast when the commit throws', async () => {
    archiveProductMock.mockRejectedValueOnce(new Error('network down'));
    const { onSaved, options } = await archive();
    onSaved.mockClear();

    await options.onSettle?.('expired');

    expect(toast.error).toHaveBeenCalledWith('Could not archive the product. Try again.');
    expect(onSaved).toHaveBeenCalledWith(product);
  });

  it('picks a preset unit from the combobox', async () => {
    const user = userEvent.setup();
    render(<ProductForm onSaved={vi.fn()} />);

    // The trigger's accessible name is always "Unit" (from its <label for>
    // association, per the button-is-labelable HTML rule) regardless of the
    // selected value, so assert on textContent instead of accessible name.
    const trigger = screen.getByRole('combobox', { name: /^unit$/i });
    await user.click(trigger);
    // cmdk filters CommandItems against the search input's current value —
    // it starts pre-filled with the field's own value ('unit'), which hides
    // every other preset until the search is cleared.
    await user.clear(screen.getByPlaceholderText(/search or enter a unit/i));
    await user.click(await screen.findByRole('option', { name: 'box' }));

    expect(trigger).toHaveTextContent('box');
  });

  it('offers and selects a custom unit not in the preset list', async () => {
    const user = userEvent.setup();
    render(<ProductForm onSaved={vi.fn()} />);

    const trigger = screen.getByRole('combobox', { name: /^unit$/i });
    await user.click(trigger);
    const search = screen.getByPlaceholderText(/search or enter a unit/i);
    await user.clear(search);
    await user.type(search, 'crate');

    // Curly quotes (&ldquo;/&rdquo;), not straight ASCII quotes, per the
    // component's actual markup.
    const custom = await screen.findByRole('option', { name: 'Use “crate”' });
    await user.click(custom);

    expect(trigger).toHaveTextContent('crate');
  });

  it('shows an inline error tied to the field instead of a toast', async () => {
    vi.mocked(toast.error).mockClear();
    saveProductMock.mockClear();
    const user = userEvent.setup();
    render(<ProductForm onSaved={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /add product/i }));

    const name = screen.getByLabelText(/^name$/i);
    const alert = await screen.findByRole('alert');
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name.getAttribute('aria-describedby')).toBe(alert.id);
    expect(saveProductMock).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('has no Active switch and keeps an existing product active on save', async () => {
    saveProductMock.mockClear();
    vi.mocked(toast.success).mockClear();
    const user = userEvent.setup();
    render(
      <ProductForm
        product={{ ...product, id: '11111111-1111-4111-8111-111111111111' }}
        onSaved={vi.fn()}
      />
    );

    expect(screen.queryByRole('switch')).toBeNull();
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(saveProductMock).toHaveBeenCalledWith(expect.objectContaining({ is_active: true }));
    expect(toast.success).toHaveBeenCalledWith('Product saved');
    expect(screen.queryByRole('button', { name: /restore product/i })).toBeNull();
  });

  it('restores an archived product through saveProduct with is_active true', async () => {
    saveProductMock.mockClear();
    vi.mocked(toast.success).mockClear();
    const onSaved = vi.fn();
    const user = userEvent.setup();
    render(
      <ProductForm
        product={{ ...product, id: '11111111-1111-4111-8111-111111111111', is_active: false }}
        onSaved={onSaved}
      />
    );

    expect(screen.queryByRole('button', { name: /archive product/i })).toBeNull();
    await user.click(screen.getByRole('button', { name: /restore product/i }));

    expect(saveProductMock).toHaveBeenCalledWith(expect.objectContaining({ is_active: true }));
    expect(toast.success).toHaveBeenCalledWith('Product restored');
    expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ is_active: true }));
  });

  it('surfaces the Free cap error when a restore is blocked', async () => {
    saveProductMock.mockClear();
    vi.mocked(toast.error).mockClear();
    saveProductMock.mockResolvedValueOnce({
      success: false,
      error: 'You can have 20 active products. Archive one to add another.',
    });
    const onSaved = vi.fn();
    const user = userEvent.setup();
    render(
      <ProductForm
        product={{ ...product, id: '11111111-1111-4111-8111-111111111111', is_active: false }}
        onSaved={onSaved}
      />
    );

    await user.click(screen.getByRole('button', { name: /restore product/i }));

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('You can have 20 active products')
    );
    expect(onSaved).not.toHaveBeenCalled();
  });
});
