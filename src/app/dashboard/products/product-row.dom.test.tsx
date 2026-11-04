// @vitest-environment jsdom
import type { Product } from '@/lib/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductRow } from './product-row';

const product: Product = {
  id: 'p1',
  vendor_id: 'v1',
  name: 'Coffee',
  unit: 'kg',
  on_hand: 10,
  unit_cost_cents: 500,
  low_stock_threshold: 2,
  is_active: true,
  created_at: '',
  updated_at: '',
};

describe('ProductRow', () => {
  it('shows the stock status for an active product', () => {
    render(<ProductRow product={product} onClick={vi.fn()} />);
    expect(screen.getByText('In stock')).toBeInTheDocument();
    expect(screen.queryByText('Archived')).not.toBeInTheDocument();
  });

  it('shows Archived instead of a stock status for an inactive product', () => {
    render(<ProductRow product={{ ...product, is_active: false }} onClick={vi.fn()} />);
    expect(screen.getByText('Archived')).toBeInTheDocument();
    expect(screen.queryByText('In stock')).not.toBeInTheDocument();
  });
});
