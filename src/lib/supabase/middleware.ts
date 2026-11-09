import { updateSupabaseSession } from '@merqo/ui/supabase/middleware';
import type { NextRequest } from 'next/server';

import { publicEnv } from '@/lib/supabase/env';

// /admin's own authorization is enforced by requireAdmin() in
// src/app/admin/layout.tsx (a Server Component, which cannot write cookies),
// so routing it through the session refresh here is what lets an /admin visit
// rotate its cookies like a /dashboard visit does.
const PROTECTED_PREFIXES = ['/dashboard', '/admin'] as const;

export function updateSession(request: NextRequest) {
  return updateSupabaseSession(request, {
    url: publicEnv.supabaseUrl,
    publishableKey: publicEnv.supabasePublishableKey,
    schema: 'stockkit',
    cookieDomain: process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN,
    protectedPrefixes: PROTECTED_PREFIXES,
  });
}
