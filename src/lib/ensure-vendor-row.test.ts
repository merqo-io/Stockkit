import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ensureVendorRow } from './ensure-vendor-row';

const getUserMock = vi.fn();
const upsertMock = vi.fn();
const supabase = {
  auth: { getUser: getUserMock },
  from: vi.fn(() => ({ upsert: upsertMock })),
} as unknown as Parameters<typeof ensureVendorRow>[0];

beforeEach(() => {
  getUserMock.mockReset().mockResolvedValue({ data: { user: null } });
  upsertMock.mockReset().mockResolvedValue({ error: null });
});

describe('ensureVendorRow', () => {
  it('does nothing without a user', async () => {
    expect(await ensureVendorRow(supabase)).toBeNull();
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it('creates the row from full_name, ignoring duplicates', async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: 'v1', user_metadata: { full_name: 'Ah Huat' } } },
    });
    expect(await ensureVendorRow(supabase)).toBe('Ah Huat');
    expect(upsertMock).toHaveBeenCalledWith(
      { id: 'v1', name: 'Ah Huat' },
      { onConflict: 'id', ignoreDuplicates: true }
    );
  });

  it('falls back to name metadata, then a placeholder, and caps at 100 chars', async () => {
    expect(await ensureVendorRow(supabase, { id: 'v2', user_metadata: { name: 'N' } })).toBe('N');
    expect(await ensureVendorRow(supabase, { id: 'v3', user_metadata: {} })).toBe('Your stall');
    const long = await ensureVendorRow(supabase, {
      id: 'v4',
      user_metadata: { full_name: 'x'.repeat(150) },
    });
    expect(long).toHaveLength(100);
    expect(getUserMock).not.toHaveBeenCalled();
  });

  it('logs an upsert error without throwing', async () => {
    upsertMock.mockResolvedValue({ error: { message: 'db unavailable' } });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await ensureVendorRow(supabase, { id: 'v1' })).toBeNull();
    expect(consoleError).toHaveBeenCalledWith('ensureVendorRow failed', 'db unavailable');
    consoleError.mockRestore();
  });
});
