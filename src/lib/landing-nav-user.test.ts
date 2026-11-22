import type { SupabaseClient, User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getOrCreate = vi.fn();
vi.mock('./merqo-vendor-profile', () => ({
  getOrCreateVendorProfile: (...a: unknown[]) => getOrCreate(...a),
}));

import { resolveLandingNavUser } from './landing-nav-user';

const supabase = {} as SupabaseClient;
const user = {
  id: 'u1',
  email: 'a@b.co',
  user_metadata: { full_name: 'Clarence Lee' },
} as unknown as User;

describe('resolveLandingNavUser', () => {
  beforeEach(() => {
    getOrCreate.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('uses the shared profile stall_name', async () => {
    getOrCreate.mockResolvedValue({ stall_name: 'My Stall' });
    const nav = await resolveLandingNavUser(supabase, user, async () => ({ name: null }));
    expect(getOrCreate).toHaveBeenCalledWith(supabase, 'u1', null);
    expect(JSON.stringify(nav)).toContain('My Stall');
    expect(JSON.stringify(nav)).not.toContain('Clarence Lee');
  });

  it('falls back to the local name when the profile read fails', async () => {
    getOrCreate.mockRejectedValue(new Error('boom'));
    const nav = await resolveLandingNavUser(supabase, user, async () => ({ name: 'Local Stall' }));
    expect(JSON.stringify(nav)).toContain('Local Stall');
  });

  it('returns null signed out', async () => {
    const read = vi.fn();
    expect(await resolveLandingNavUser(supabase, null, read)).toBeNull();
    expect(getOrCreate).not.toHaveBeenCalled();
  });
});
