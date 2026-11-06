import { createBrowserClient } from '@supabase/ssr';

import { authCookieOptions } from '@/lib/supabase/cookie-options';
import { publicEnv } from '@/lib/supabase/env';
import type { Database } from '@/lib/types';

export function createClient() {
  return createBrowserClient<Database, 'stockkit'>(
    publicEnv.supabaseUrl,
    publicEnv.supabasePublishableKey,
    { cookieOptions: authCookieOptions(), db: { schema: 'stockkit' } }
  );
}
