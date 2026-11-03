import { describe, expect, it } from 'vitest';
import { ENTITLEMENTS, resolvePlanView, resolveTier } from './plan';

describe('resolveTier', () => {
  const now = new Date('2026-11-03T00:00:00Z');

  it('is free without a cache row', () => {
    expect(resolveTier(null, now)).toBe('free');
    expect(resolveTier(undefined, now)).toBe('free');
  });

  it('is free for a free row', () => {
    expect(resolveTier({ tier: 'free', valid_until: null }, now)).toBe('free');
  });

  it('is pro for a paid row with no expiry', () => {
    expect(resolveTier({ tier: 'paid', valid_until: null }, now)).toBe('pro');
  });

  it('is pro for a paid row that has not yet lapsed', () => {
    expect(resolveTier({ tier: 'paid', valid_until: '2026-11-04T00:00:00Z' }, now)).toBe('pro');
  });

  it('lapses to free once valid_until has passed, with no push', () => {
    expect(resolveTier({ tier: 'paid', valid_until: '2026-11-02T00:00:00Z' }, now)).toBe('free');
    expect(resolveTier({ tier: 'paid', valid_until: '2026-11-03T00:00:00Z' }, now)).toBe('free');
  });

  it('treats an unrecognised tier as free', () => {
    expect(resolveTier({ tier: 'PAID', valid_until: null }, now)).toBe('free');
  });
});

describe('ENTITLEMENTS', () => {
  it('caps Free at 20 products, 10-row movement history, no CSV export', () => {
    expect(ENTITLEMENTS.free).toEqual({
      tier: 'free',
      maxActiveProducts: 20,
      movementHistoryLimit: 10,
      csvExport: false,
    });
  });

  it('gives Pro unlimited products and history, plus CSV export', () => {
    expect(ENTITLEMENTS.pro).toEqual({
      tier: 'pro',
      maxActiveProducts: null,
      movementHistoryLimit: null,
      csvExport: true,
    });
  });
});

describe('resolvePlanView', () => {
  it('renders Free as capped metrics and no CSV line', () => {
    const view = resolvePlanView('free', ENTITLEMENTS.free);
    expect(view.tier).toBe('free');
    expect(view.label).toBe('Free');
    expect(view.features).toEqual([
      { kind: 'metric', prefix: 'Up to', value: 20, suffix: 'active products' },
      { kind: 'metric', prefix: 'Last', value: 10, suffix: 'stock movements per product' },
    ]);
  });

  it('renders Pro as unlimited text lines and CSV export', () => {
    const view = resolvePlanView('pro', ENTITLEMENTS.pro);
    expect(view.label).toBe('Pro');
    expect(view.features).toEqual([
      { kind: 'text', text: 'Unlimited products' },
      { kind: 'text', text: 'Full stock movement history' },
      { kind: 'text', text: 'CSV export' },
    ]);
  });

  it('never advertises the unbuilt valuation-trend feature on Pro', () => {
    const view = resolvePlanView('pro', ENTITLEMENTS.pro);
    const hasComingSoonClaim = view.features.some(
      (f) => f.kind === 'text' && /coming soon/i.test(f.text)
    );
    expect(hasComingSoonClaim).toBe(false);
  });

  it('keeps every numeric limit out of the surrounding prose so it can be font-mono', () => {
    const metrics = resolvePlanView('free', ENTITLEMENTS.free).features.filter(
      (f) => f.kind === 'metric'
    );
    expect(metrics).toHaveLength(2);
    for (const metric of metrics) {
      expect(typeof metric.value).toBe('number');
      expect(metric.prefix).not.toMatch(/\d/);
      expect(metric.suffix).not.toMatch(/\d/);
    }
  });
});
