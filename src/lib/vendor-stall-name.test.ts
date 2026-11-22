import { beforeEach, describe, expect, it, vi } from 'vitest';

import { readVendorStallName } from './vendor-stall-name';

const { createServiceClientMock, maybeSingleMock, fromMock, schemaMock, eqMock, selectMock } =
  vi.hoisted(() => ({
    createServiceClientMock: vi.fn(),
    maybeSingleMock: vi.fn(),
    fromMock: vi.fn(),
    schemaMock: vi.fn(),
    eqMock: vi.fn(),
    selectMock: vi.fn(),
  }));

vi.mock('@/lib/supabase/server', () => ({ createServiceClient: createServiceClientMock }));

beforeEach(() => {
  vi.clearAllMocks();
  eqMock.mockReturnValue({ maybeSingle: maybeSingleMock });
  selectMock.mockReturnValue({ eq: eqMock });
  fromMock.mockReturnValue({ select: selectMock });
  schemaMock.mockReturnValue({ from: fromMock });
  createServiceClientMock.mockResolvedValue({ schema: schemaMock });
});

describe('readVendorStallName', () => {
  it('reads the shared merqo.vendor_profile stall name without creating a row', async () => {
    maybeSingleMock.mockResolvedValue({ data: { stall_name: 'My Stall' }, error: null });
    expect(await readVendorStallName('v1')).toBe('My Stall');
    expect(schemaMock).toHaveBeenCalledWith('merqo');
    expect(fromMock).toHaveBeenCalledWith('vendor_profile');
    expect(selectMock).toHaveBeenCalledWith('stall_name');
    expect(eqMock).toHaveBeenCalledWith('vendor_id', 'v1');
  });

  it('returns null when the vendor has no profile row yet', async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: null });
    expect(await readVendorStallName('v1')).toBeNull();
  });

  it('returns null on a query error', async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: { message: 'denied' } });
    expect(await readVendorStallName('v1')).toBeNull();
  });

  it('returns null when the client throws', async () => {
    createServiceClientMock.mockRejectedValue(new Error('no secret'));
    expect(await readVendorStallName('v1')).toBeNull();
  });
});
