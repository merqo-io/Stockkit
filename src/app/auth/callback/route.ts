import { NextResponse } from 'next/server';

import { PAGE_ROUTES } from '@/lib/constants/routes';
import { ensureVendorRow } from '@/lib/ensure-vendor-row';
import { authCallbackQuerySchema, redirectPathSchema } from '@/lib/schemas';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const query = authCallbackQuerySchema.safeParse({
    code: searchParams.get('code') ?? undefined,
  });

  // Where to land after the session is established. Both OAuth sign-in and
  // the password-recovery link route through here; recovery passes
  // ?next=/reset-password. Only a same-origin relative path is accepted, so
  // the param can't be used as an open redirect.
  const next = redirectPathSchema.safeParse(searchParams.get('next'));
  const safeNext = next.success ? next.data : PAGE_ROUTES.DASHBOARD;

  if (!query.success) return NextResponse.redirect(`${origin}${PAGE_ROUTES.LOGIN}?error=oauth`);

  const supabase = await createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(query.data.code);
  if (error) return NextResponse.redirect(`${origin}${PAGE_ROUTES.LOGIN}?error=oauth`);

  await ensureVendorRow(supabase);

  return NextResponse.redirect(`${origin}${safeNext}`);
}
