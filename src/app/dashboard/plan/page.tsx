import { PAGE_ROUTES } from '@/lib/constants/routes';
import { merqoBaseUrl } from '@/lib/merqo-base-url';
import { ENTITLEMENTS, resolvePlanView } from '@/lib/plan';
import { createServerClient } from '@/lib/supabase/server';
import { readVendorTier } from '@/lib/vendor-entitlement';
import { BackButton, fetchPlanCatalog, PageHeader, PricingLadder } from '@merqo/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { RequestProButton } from './request-pro-button';

export const metadata: Metadata = { title: 'Plan' };

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
  // Prices live only in merqo's catalog; null means merqo is unreachable, and
  // the page must still render without them.
  const catalog = await fetchPlanCatalog(merqoBaseUrl());

  return (
    <div className="space-y-6">
      <BackButton LinkComponent={Link} href={PAGE_ROUTES.DASHBOARD} label="Overview" />
      <PageHeader eyebrow="Your account" title="Plan" className="mb-1">
        You are on the <span className="capitalize">{plan}</span> plan.
      </PageHeader>

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
        <div className="mt-4">
          {plan === 'free' ? (
            <RequestProButton />
          ) : (
            <p className="text-muted-foreground text-sm">You have every stockkit feature.</p>
          )}
        </div>
      </div>

      <section aria-labelledby="plans-heading" className="space-y-4">
        <h2 id="plans-heading" className="text-lg font-semibold tracking-tight">
          Plans
        </h2>
        {catalog ? (
          <PricingLadder catalog={catalog} highlight="all_access" showEventPass={false} />
        ) : (
          <p className="text-muted-foreground text-sm">
            Prices are unavailable right now. Check back shortly.
          </p>
        )}
      </section>
    </div>
  );
}
