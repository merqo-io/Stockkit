import { createSupabaseServerClient, createSupabaseServiceClient } from '@merqo/ui/supabase/server';

import { publicEnv } from '@/lib/supabase/env';
import type { Database } from '@/lib/types';

export function createServerClient() {
  return createSupabaseServerClient<Database, 'stockkit'>({
    url: publicEnv.supabaseUrl,
    publishableKey: publicEnv.supabasePublishableKey,
    schema: 'stockkit',
    cookieDomain: process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN,
  });
}

// Bypasses RLS: use only in Server Actions and Route Handlers. The secret is
// read here rather than in lib/supabase/env, which client code may import.
export async function createServiceClient() {
  return createSupabaseServiceClient<Database, 'stockkit'>({
    url: publicEnv.supabaseUrl,
    secretKey: process.env.SUPABASE_SECRET_KEY,
    schema: 'stockkit',
  });
}
