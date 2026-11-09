import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  browser: vi.fn(),
  server: vi.fn(),
  service: vi.fn(),
  session: vi.fn(),
}));

vi.mock('@merqo/ui/supabase', () => ({ createSupabaseBrowserClient: mocks.browser }));
vi.mock('@merqo/ui/supabase/server', () => ({
  createSupabaseServerClient: mocks.server,
  createSupabaseServiceClient: mocks.service,
}));
vi.mock('@merqo/ui/supabase/middleware', () => ({ updateSupabaseSession: mocks.session }));
vi.mock('./env', () => ({
  publicEnv: { supabaseUrl: 'https://test.invalid', supabasePublishableKey: 'public-test' },
}));

import { createClient } from './client';
import { updateSession } from './middleware';
import { createServerClient, createServiceClient } from './server';

beforeEach(() => vi.resetAllMocks());
afterEach(() => vi.unstubAllEnvs());

describe('Supabase wrappers bind the stockkit schema and shared cookie domain', () => {
  it('scopes the browser client to stockkit', () => {
    vi.stubEnv('NEXT_PUBLIC_AUTH_COOKIE_DOMAIN', '.merqo.io');
    createClient();
    expect(mocks.browser).toHaveBeenCalledWith({
      url: 'https://test.invalid',
      publishableKey: 'public-test',
      schema: 'stockkit',
      cookieDomain: '.merqo.io',
    });
  });

  it('scopes the vendor server client to stockkit', async () => {
    vi.stubEnv('NEXT_PUBLIC_AUTH_COOKIE_DOMAIN', '.merqo.io');
    await createServerClient();
    expect(mocks.server).toHaveBeenCalledWith({
      url: 'https://test.invalid',
      publishableKey: 'public-test',
      schema: 'stockkit',
      cookieDomain: '.merqo.io',
    });
  });

  it('hands the service client the secret key and no publishable key', async () => {
    vi.stubEnv('SUPABASE_SECRET_KEY', 'synthetic-test-key');
    await createServiceClient();
    expect(mocks.service).toHaveBeenCalledWith({
      url: 'https://test.invalid',
      secretKey: 'synthetic-test-key',
      schema: 'stockkit',
    });
  });

  it('protects /dashboard and /admin in the session refresh', () => {
    vi.stubEnv('NEXT_PUBLIC_AUTH_COOKIE_DOMAIN', '');
    const request = new NextRequest('https://stockkit.merqo.io/admin');
    updateSession(request);
    expect(mocks.session).toHaveBeenCalledWith(request, {
      url: 'https://test.invalid',
      publishableKey: 'public-test',
      schema: 'stockkit',
      cookieDomain: '',
      protectedPrefixes: ['/dashboard', '/admin'],
    });
  });
});
