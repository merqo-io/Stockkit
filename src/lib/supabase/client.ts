import { createSupabaseBrowserClient } from '@merqo/ui/supabase';

import { publicEnv } from '@/lib/supabase/env';
import type { Database } from '@/lib/types';

export function createClient() {
  return createSupabaseBrowserClient<Database, 'stockkit'>({
    url: publicEnv.supabaseUrl,
    publishableKey: publicEnv.supabasePublishableKey,
    schema: 'stockkit',
    // The reference stays literal so Next inlines it into the browser bundle.
    cookieDomain: process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN,
  });
}
