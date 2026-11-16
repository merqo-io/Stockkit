import { PAGE_ROUTES } from '@/lib/constants/routes';
import { ensureVendorRow } from '@/lib/ensure-vendor-row';
import { createServerClient } from '@/lib/supabase/server';
import { handleAuthConfirm } from '@merqo/ui/auth';

export function POST(request: Request) {
  return handleAuthConfirm(request, {
    createClient: createServerClient,
    defaultNext: PAGE_ROUTES.DASHBOARD,
    loginPath: PAGE_ROUTES.LOGIN,
    afterSignIn: async (supabase) => {
      await ensureVendorRow(supabase as Parameters<typeof ensureVendorRow>[0]);
    },
    recovery: { path: PAGE_ROUTES.RESET_PASSWORD },
  });
}
