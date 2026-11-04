import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Page from './page';
const m = vi.hoisted(() => ({
  getUser: vi.fn(),
  order: vi.fn(),
  eq: vi.fn(),
  select: vi.fn(),
  from: vi.fn(),
}));
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: async () => ({ auth: { getUser: m.getUser }, from: m.from }),
}));
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));
beforeEach(() => {
  vi.clearAllMocks();
  m.getUser.mockResolvedValue({ data: { user: { id: 'v1' } } });
  m.order.mockResolvedValue({ data: null });
  m.eq.mockReturnValue({
    order: () => ({
      limit: () => ({
        gt: () => Promise.resolve({ data: [], error: null }),
        then: (resolve: (value: unknown) => void) => m.order().then(resolve),
      }),
    }),
  });
  m.select.mockReturnValue({ eq: m.eq });
  m.from.mockReturnValue({ select: m.select });
});
describe('inventory overview', () => {
  it('redirects signed-out callers without querying inventory', async () => {
    m.getUser.mockResolvedValue({ data: { user: null } });
    await expect(Page()).rejects.toThrow('redirect:/login');
    expect(m.from).not.toHaveBeenCalled();
  });
  it('guides vendors with no inventory to create a product', async () => {
    expect(renderToStaticMarkup(await Page())).toContain('Add your first product');
    expect(m.eq).toHaveBeenCalledWith('is_active', true);
  });
  it('calculates value and prioritizes out-of-stock over low stock', async () => {
    m.order.mockResolvedValue({
      data: [
        {
          id: 'low',
          name: 'Low coffee',
          on_hand: 2,
          unit_cost_cents: 500,
          low_stock_threshold: 2,
          unit: 'kg',
        },
        {
          id: 'out',
          name: 'Empty tea',
          on_hand: 0,
          unit_cost_cents: 300,
          low_stock_threshold: 1,
          unit: 'kg',
        },
        {
          id: 'ok',
          name: 'Healthy milk',
          on_hand: 10,
          unit_cost_cents: 200,
          low_stock_threshold: 2,
          unit: 'kg',
        },
      ],
    });
    const html = renderToStaticMarkup(await Page());
    expect(html).toContain('30.00');
    expect(html).toContain('Needs attention');
    expect(html.indexOf('Empty tea')).toBeLessThan(html.indexOf('Low coffee'));
    expect(html).not.toContain('Healthy milk');
    expect(html).toContain('>Overview</h1>');
    expect(html).toContain('Low at');
    expect(html).not.toContain('Threshold');
    expect(html).toMatch(/<a [^>]*href="\/dashboard\/products"[^>]*>[^]*?Empty tea/);
    expect(html).not.toContain('more</a>');
    expect(html).not.toMatch(/stat[^"]*text-stock-(low|out)/);
  });
  it('caps rows at five and links the remainder to Products', async () => {
    m.order.mockResolvedValue({
      data: Array.from({ length: 7 }, (_, i) => ({
        id: `p${i}`,
        name: `Item ${i}`,
        on_hand: 0,
        unit_cost_cents: 100,
        low_stock_threshold: 1,
        unit: 'kg',
      })),
    });
    const html = renderToStaticMarkup(await Page());
    expect(html).toContain('+2 more');
    expect(html).not.toContain('Item 6');
  });
  it('omits urgent alerts for healthy inventory', async () => {
    m.order.mockResolvedValue({
      data: [{ id: 'ok', name: 'Milk', on_hand: 10, unit_cost_cents: 200, low_stock_threshold: 2 }],
    });
    const html = renderToStaticMarkup(await Page());
    expect(html).toContain('20.00');
    expect(html).not.toContain('Needs attention');
  });
});

it('surfaces inventory failures instead of suggesting the account is empty', async () => {
  m.order.mockResolvedValue({ data: null, error: { message: 'offline' } });
  await expect(Page()).rejects.toThrow('Could not load inventory');
});
