# File layout

Moved out of `AGENTS.md` to keep the always-loaded context small.

```
src/app/(auth)/login/            — combined sign-in/sign-up page + completeSignup action
src/app/(public)/                — landing page
src/app/dashboard/               — vendor dashboard: layout (session + sign-out), overview stats
src/app/dashboard/products/      — products workspace: list/detail UI + server actions
src/proxy.ts                     — Supabase session refresh + /dashboard guard (Next 16)
src/lib/supabase/                — browser / server / service clients + middleware helper
src/lib/types.ts                 — DB types (hand-maintained mirror of supabase/migrations)
src/lib/schemas.ts                — Zod schemas for forms + actions, money-cents helpers
src/lib/stock.ts                  — shared stock-status (ok/low/out) classification
src/components/ui/                — shadcn primitives (CLI-managed style; do not hand-edit)
supabase/migrations/              — SQL schema + RLS + record_stock_movement/sync_vendor_profile
```
