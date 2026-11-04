import { describe, expect, it } from 'vitest';

import { productStatusFor, stockStatusFor } from './stock';

describe('stockStatusFor', () => {
  it('is out when on_hand is zero', () => {
    expect(stockStatusFor(0, 5)).toBe('out');
  });

  it('is out when on_hand is negative', () => {
    expect(stockStatusFor(-1, 5)).toBe('out');
  });

  it('is low when on_hand equals the threshold (boundary is inclusive)', () => {
    expect(stockStatusFor(5, 5)).toBe('low');
  });

  it('is low when on_hand is between zero and the threshold', () => {
    expect(stockStatusFor(3, 5)).toBe('low');
  });

  it('is ok when on_hand is just above the threshold', () => {
    expect(stockStatusFor(6, 5)).toBe('ok');
  });

  it('is ok when on_hand is well above the threshold', () => {
    expect(stockStatusFor(100, 5)).toBe('ok');
  });

  it('is out when on_hand and threshold are both zero (out beats low)', () => {
    expect(stockStatusFor(0, 0)).toBe('out');
  });

  it('is ok when the threshold is zero and on_hand is positive', () => {
    expect(stockStatusFor(1, 0)).toBe('ok');
  });
});

describe('stock movement labels', () => {
  it('preserves opening balances and unknown reasons', async () => {
    const { stockMovementReasonLabel } = await import('./stock');
    expect(stockMovementReasonLabel('initial')).toBe('Initial balance');
    expect(stockMovementReasonLabel('restock')).toBe('Restock');
    expect(stockMovementReasonLabel('future')).toBe('future');
    expect(stockMovementReasonLabel('toString')).toBe('toString');
  });
});

describe('productStatusFor', () => {
  const base = { on_hand: 10, low_stock_threshold: 2 };

  it('is archived for an inactive product whatever its stock level', () => {
    expect(productStatusFor({ ...base, is_active: false })).toBe('archived');
    expect(productStatusFor({ is_active: false, on_hand: 1, low_stock_threshold: 2 })).toBe(
      'archived'
    );
    expect(productStatusFor({ is_active: false, on_hand: 0, low_stock_threshold: 2 })).toBe(
      'archived'
    );
  });

  it('falls through to the stock status for an active product', () => {
    expect(productStatusFor({ ...base, is_active: true })).toBe('ok');
    expect(productStatusFor({ is_active: true, on_hand: 2, low_stock_threshold: 2 })).toBe('low');
    expect(productStatusFor({ is_active: true, on_hand: 0, low_stock_threshold: 2 })).toBe('out');
  });
});
