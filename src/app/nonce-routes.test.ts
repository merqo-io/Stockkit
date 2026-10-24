import { describe, expect, it } from 'vitest';
import * as authLayout from './(auth)/layout';

// A nonce CSP only works on pages rendered per request; a prerendered page
// has no nonce on its scripts and would be blocked.
describe('nonce routes render per request', () => {
  it('the (auth) layout forces dynamic rendering', () => {
    expect(authLayout.dynamic).toBe('force-dynamic');
  });
});
