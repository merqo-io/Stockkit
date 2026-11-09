// Routes that always render per request, so they can carry a CSP nonce. A
// statically prerendered page under one of these would lose its scripts, and
// the shared default list is every kit's union, so stockkit passes its own.
export const NONCE_PREFIXES = [
  '/admin',
  '/mfa',
  '/dashboard',
  '/auth',
  '/login',
  '/reset-password',
  '/legal/accept',
] as const;
