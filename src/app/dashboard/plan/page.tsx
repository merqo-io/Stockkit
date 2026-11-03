import { PAGE_ROUTES } from '@/lib/constants/routes';
import { ENTITLEMENTS, resolvePlanView } from '@/lib/plan';
import { createServerClient } from '@/lib/supabase/server';
import { readVendorTier } from '@/lib/vendor-entitlement';
import { BackButton } from '@merqo/ui';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function PlanPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Defense in depth — proxy.ts already redirects unauthenticated requests
  // to /login before this page renders.
  if (!user) redirect('/login');

  const plan = (await readVendorTier(supabase, user.id)) ?? 'free';
  const view = resolvePlanView(plan, ENTITLEMENTS[plan]);

  return (
    <div className="space-y-6 py-8">
      <BackButton LinkComponent={Link} href={PAGE_ROUTES.DASHBOARD} label="Dashboard" />
      <header>
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
          Your account
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Plan</h1>
      </header>

      <div className="border-border rounded-xl border p-4">
        <p className="text-sm font-medium">
          Current plan: <span className="capitalize">{plan}</span>
        </p>
      </div>

      <div className="border-border rounded-xl border p-4">
        <p className="text-sm font-medium">{view.label}</p>
        <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
          {view.features.map((feature) => (
            <li key={feature.kind === 'text' ? feature.text : feature.prefix}>
              {feature.kind === 'text' ? (
                feature.text
              ) : (
                <>
                  {feature.prefix} <span className="font-mono">{feature.value}</span>{' '}
                  {feature.suffix}
                </>
              )}
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mt-3 text-sm">Change plan from your Merqo account.</p>
      </div>
    </div>
  );
}
