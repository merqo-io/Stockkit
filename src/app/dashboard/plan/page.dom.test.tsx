// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PlanPage from './page';

const { createServerClientMock, readVendorTierMock, fetchPlanCatalogMock, pricingLadderMock } =
  vi.hoisted(() => ({
    createServerClientMock: vi.fn(),
    readVendorTierMock: vi.fn(),
    fetchPlanCatalogMock: vi.fn(),
    pricingLadderMock: vi.fn(),
  }));

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: createServerClientMock,
}));

vi.mock('@/lib/vendor-entitlement', () => ({
  readVendorTier: readVendorTierMock,
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

vi.mock('@merqo/ui', () => ({
  BackButton: ({ label }: { label: string }) => <span>{label}</span>,
  fetchPlanCatalog: fetchPlanCatalogMock,
  PricingLadder: (props: Record<string, unknown>) => {
    pricingLadderMock(props);
    return <div data-testid="pricing-ladder" />;
  },
}));

const originalBaseUrl = process.env.MERQO_BASE_URL;

beforeEach(() => {
  createServerClientMock.mockReset().mockResolvedValue({
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) },
  });
  readVendorTierMock.mockReset().mockResolvedValue('free');
  fetchPlanCatalogMock.mockReset();
  pricingLadderMock.mockReset();
  delete process.env.MERQO_BASE_URL;
});

afterEach(() => {
  if (originalBaseUrl === undefined) delete process.env.MERQO_BASE_URL;
  else process.env.MERQO_BASE_URL = originalBaseUrl;
});

describe('PlanPage', () => {
  it('renders the ladder highlighting all_access when the catalog loads', async () => {
    const catalog = { plans: [] };
    fetchPlanCatalogMock.mockResolvedValue(catalog);
    render(await PlanPage());

    expect(screen.getByTestId('pricing-ladder')).toBeTruthy();
    expect(screen.getByText(/Current plan:/)).toBeTruthy();
    expect(pricingLadderMock).toHaveBeenCalledWith({
      catalog,
      highlight: 'all_access',
      showEventPass: false,
    });
    expect(screen.queryByText(/Prices are unavailable/)).toBeNull();
  });

  it('falls back to the default merqo base url', async () => {
    fetchPlanCatalogMock.mockResolvedValue(null);
    await PlanPage();
    expect(fetchPlanCatalogMock).toHaveBeenCalledWith('https://www.merqo.io');
  });

  it('uses MERQO_BASE_URL when set', async () => {
    process.env.MERQO_BASE_URL = 'https://merqo.test';
    fetchPlanCatalogMock.mockResolvedValue(null);
    await PlanPage();
    expect(fetchPlanCatalogMock).toHaveBeenCalledWith('https://merqo.test');
  });

  it('shows the current plan and a calm note, with no prices, when the catalog is null', async () => {
    fetchPlanCatalogMock.mockResolvedValue(null);
    const { container } = render(await PlanPage());

    expect(screen.getByText(/Current plan:/)).toBeTruthy();
    expect(screen.getByText('Prices are unavailable right now. Check back shortly.')).toBeTruthy();
    expect(screen.queryByTestId('pricing-ladder')).toBeNull();
    expect(container.textContent).not.toContain('S$');
  });
});
