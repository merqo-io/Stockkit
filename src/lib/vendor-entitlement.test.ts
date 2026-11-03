import { describe, expect, it, vi } from 'vitest';

import { readAllVendorTiers, readVendorTier } from './vendor-entitlement';

type Client = Parameters<typeof readVendorTier>[0];

function singleRowClient(result: { data: unknown; error: { message: string } | null }) {
  return {
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => result }) }),
    }),
  } as unknown as Client;
}

const now = new Date('2026-11-03T00:00:00Z');

describe('readVendorTier', () => {
  it('is free when the vendor has no cache row', async () => {
    expect(await readVendorTier(singleRowClient({ data: null, error: null }), 'v1', now)).toBe(
      'free'
    );
  });

  it('is pro for a live paid row', async () => {
    const client = singleRowClient({ data: { tier: 'paid', valid_until: null }, error: null });
    expect(await readVendorTier(client, 'v1', now)).toBe('pro');
  });

  it('is free once a paid row has lapsed', async () => {
    const client = singleRowClient({
      data: { tier: 'paid', valid_until: '2026-11-02T00:00:00Z' },
      error: null,
    });
    expect(await readVendorTier(client, 'v1', now)).toBe('free');
  });

  it('returns null and logs when the read fails', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    const client = singleRowClient({ data: null, error: { message: 'connection reset' } });
    expect(await readVendorTier(client, 'v1', now)).toBeNull();
    expect(logged).toHaveBeenCalledWith('readVendorTier failed', 'connection reset');
    logged.mockRestore();
  });
});

describe('readAllVendorTiers', () => {
  it('maps each cached vendor to its resolved tier', async () => {
    const pages = [
      {
        data: [
          { id: 'a', tier: 'paid', valid_until: null },
          { id: 'b', tier: 'paid', valid_until: '2000-01-01T00:00:00Z' },
        ],
        error: null,
      },
      { data: [], error: null },
    ];
    const query = {
      select: () => query,
      order: () => query,
      limit: () => query,
      gt: () => query,
      then: (resolve: (value: unknown) => unknown) => Promise.resolve(pages.shift()).then(resolve),
    };
    const client = { from: () => query } as unknown as Parameters<typeof readAllVendorTiers>[0];
    const { tiers, error } = await readAllVendorTiers(client, now);
    expect(error).toBeNull();
    expect(tiers.get('a')).toBe('pro');
    expect(tiers.get('b')).toBe('free');
  });
});
