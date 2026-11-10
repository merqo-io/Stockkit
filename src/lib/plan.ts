// Vendor-facing 'free'|'pro' differs from the wire and table 'free'|'paid' on
// purpose; paid maps to pro.
export type Tier = 'free' | 'pro';

/**
 * A vendor's resolved capabilities. `null` on a cap means unlimited —
 * `null` (not Infinity) so the object serializes cleanly across the
 * server->client boundary for gating UI. Mirrors qkit's src/lib/plan.ts
 * shape, sized to stockkit's 2 real gates.
 */
export interface Entitlement {
  tier: Tier;
  maxActiveProducts: number | null;
  movementHistoryLimit: number | null;
  csvExport: boolean;
}

const FREE: Entitlement = {
  tier: 'free',
  maxActiveProducts: 20,
  movementHistoryLimit: 10,
  csvExport: false,
};

const PRO: Entitlement = {
  tier: 'pro',
  maxActiveProducts: null,
  movementHistoryLimit: null,
  csvExport: true,
};

export const ENTITLEMENTS: Record<Tier, Entitlement> = { free: FREE, pro: PRO };

/** The cached subset of merqo's entitlement push that decides the tier. */
export interface CachedEntitlement {
  tier: string;
  valid_until: string | null;
}

/**
 * Resolve a vendor's tier from the entitlement cache. Mirrors the SQL helper
 * `stockkit.vendor_is_paid` (migration 0025): paid means tier 'paid' and a
 * `valid_until` that is null or still in the future. Merqo has no cron, so a
 * lapse applies here by comparing against `now`, not by waiting for a push.
 * A missing row or anything unrecognised degrades to free.
 */
export function resolveTier(row: CachedEntitlement | null | undefined, now: Date): Tier {
  if (!row || row.tier !== 'paid') return 'free';
  if (row.valid_until === null) return 'pro';
  return new Date(row.valid_until).getTime() > now.getTime() ? 'pro' : 'free';
}

/**
 * One line of a plan's feature list. `metric` keeps the number separate from
 * its surrounding words so the page can wrap it in `font-mono` — the app's
 * ledger typographic signature applies to every figure shown to a vendor.
 */
type PlanFeature =
  | { kind: 'text'; text: string }
  | { kind: 'metric'; prefix: string; value: number; suffix: string };

/** Everything the plan page renders, derived from a tier + its entitlement. */
export interface PlanView {
  tier: Tier;
  label: string;
  features: PlanFeature[];
}

/**
 * Resolve what the plan page shows for a tier. Extracted from the page's JSX
 * so the free-vs-pro branching is unit-testable without rendering a server
 * component (this repo has no precedent for rendering those in tests).
 */
export function resolvePlanView(plan: Tier, entitlement: Entitlement): PlanView {
  const features: PlanFeature[] = [
    entitlement.maxActiveProducts === null
      ? { kind: 'text', text: 'Unlimited products' }
      : {
          kind: 'metric',
          prefix: 'Up to',
          value: entitlement.maxActiveProducts,
          suffix: 'active products',
        },
    entitlement.movementHistoryLimit === null
      ? { kind: 'text', text: 'Full stock movement history' }
      : {
          kind: 'metric',
          prefix: 'Last',
          value: entitlement.movementHistoryLimit,
          suffix: 'stock movements per product',
        },
  ];
  if (entitlement.csvExport) features.push({ kind: 'text', text: 'CSV export' });

  return {
    tier: plan,
    label: plan === 'pro' ? 'Pro' : 'Free',
    features,
  };
}
