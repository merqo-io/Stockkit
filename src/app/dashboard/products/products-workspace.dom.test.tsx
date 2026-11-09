// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Product } from '@/lib/types';

vi.mock('./product-form', () => ({
  ProductForm: () => <div data-testid="product-form" />,
}));
vi.mock('./product-detail', () => ({
  ProductDetail: ({ product }: { product: Product }) => (
    <div data-testid="product-detail">{product.name}</div>
  ),
}));
vi.mock('./product-row', () => ({
  ProductRow: ({
    product,
    onClick,
  }: {
    product: Product;
    selected?: boolean;
    onClick: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {product.name}
    </button>
  ),
}));

import { ProductsWorkspace } from './products-workspace';

const product = (overrides: Partial<Product> = {}): Product => ({
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
  ...overrides,
});

describe('ProductsWorkspace desktop detail panel', () => {
  it('shows the empty-state placeholder when nothing is selected', () => {
    render(<ProductsWorkspace initialProducts={[product()]} />);

    expect(screen.getByText(/select a product to log stock/i)).toBeTruthy();
  });

  it('shows the product form when starting a new product from the desktop button', async () => {
    const user = userEvent.setup();
    render(<ProductsWorkspace initialProducts={[product()]} />);

    // Two "Add product" buttons render (mobile md:hidden, desktop hidden md:inline-flex) —
    // jsdom doesn't evaluate Tailwind's responsive display classes, so both are queryable;
    // the desktop one (startNewDesktop) is the second in DOM order.
    const addButtons = screen.getAllByRole('button', { name: /add product/i });
    await user.click(addButtons[addButtons.length - 1]);
    expect(screen.getByTestId('product-form')).toBeTruthy();
  });

  it('shows the selected product detail after clicking a row', async () => {
    const user = userEvent.setup();
    render(<ProductsWorkspace initialProducts={[product({ name: 'Chicken thigh' })]} />);

    const rows = screen.getAllByRole('button', { name: 'Chicken thigh' });
    await user.click(rows[rows.length - 1]);

    expect(screen.getByTestId('product-detail')).toHaveTextContent('Chicken thigh');
  });
});

it('lets a vendor create their first product from the empty desktop workspace', async () => {
  const user = userEvent.setup();
  render(<ProductsWorkspace initialProducts={[]} />);
  const buttons = screen.getAllByRole('button', { name: /add product/i });
  await user.click(buttons[buttons.length - 1]);
  expect(screen.getByTestId('product-form')).toBeInTheDocument();
});

describe('ProductsWorkspace filter and search', () => {
  const items = [
    product({ id: 'a', name: 'Rice', on_hand: 10 }),
    product({ id: 'b', name: 'Beans', on_hand: 1, low_stock_threshold: 3 }),
    product({ id: 'c', name: 'Salt', on_hand: 0 }),
    product({ id: 'd', name: 'Old tin', is_active: false }),
  ];

  it('lists active products under All and hides archived ones', () => {
    render(<ProductsWorkspace initialProducts={items} />);
    expect(screen.getByRole('button', { name: 'Rice' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Old tin' })).toBeNull();
  });

  it('filters by Low, Out and Archived', async () => {
    const user = userEvent.setup();
    render(<ProductsWorkspace initialProducts={items} />);

    await user.click(screen.getByRole('radio', { name: 'Low' }));
    expect(screen.getByRole('button', { name: 'Beans' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Rice' })).toBeNull();

    await user.click(screen.getByRole('radio', { name: 'Out' }));
    expect(screen.getByRole('button', { name: 'Salt' })).toBeTruthy();

    await user.click(screen.getByRole('radio', { name: 'Archived' }));
    expect(screen.getByRole('button', { name: 'Old tin' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Archived' }).getAttribute('aria-checked')).toBe(
      'true'
    );
  });

  it('searches by name and shows an empty state with no match', async () => {
    const user = userEvent.setup();
    render(<ProductsWorkspace initialProducts={items} />);

    await user.type(screen.getByRole('searchbox', { name: 'Search products' }), 'bea');
    expect(screen.getByRole('button', { name: 'Beans' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Rice' })).toBeNull();

    await user.type(screen.getByRole('searchbox', { name: 'Search products' }), 'zzz');
    expect(screen.getByText('No matching products')).toBeTruthy();
  });

  it('shows the active-product meter only when a cap applies', () => {
    const { rerender } = render(
      <ProductsWorkspace initialProducts={items} maxActiveProducts={20} />
    );
    expect(screen.getByRole('meter', { name: 'Active products used' })).toBeTruthy();
    expect(screen.getByText('active', { exact: false })).toBeTruthy();
    rerender(<ProductsWorkspace initialProducts={items} maxActiveProducts={null} />);
    expect(screen.queryByRole('meter')).toBeNull();
  });

  it('preselects the product named by initialSelectedId', () => {
    render(<ProductsWorkspace initialProducts={items} initialSelectedId="b" />);
    expect(screen.getByTestId('product-detail')).toHaveTextContent('Beans');
  });
});
