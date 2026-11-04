<!-- templateCentral: nextjs@7.2.2 (Supabase variant — shared project, schema per kit) -->

# AGENTS.md — stockkit

> STOP — This project diverges from the stock templateCentral Next.js stack on
> the data layer only. Auth/DB are **Supabase** (`@supabase/ssr`), not
> better-auth + Drizzle. Authorization is enforced in Postgres via **RLS**, not
> an app repository layer. Runtime matches tc: Next 16, route protection in
> `src/proxy.ts`, and `cookies()`/`headers()`/`params`/`searchParams` are async.

## What stockkit is

Inventory tracking for small vendors — v1 / first cut. A vendor signs in, adds
the products they stock, and logs stock in/out (restock, waste, adjustment)
against a running on-hand count and per-unit cost. The dashboard surfaces
total inventory value and low/out-of-stock alerts.

This is standalone: manual stock in/out and costing only. Tying stock
movement to qkit's sales automatically (the "ties stock movement to your
sales" tagline in `merqo/src/lib/kits.ts`) is a real planned cross-kit
feature but is **not built** — deliberately out of scope for this pass. Don't
assume any qkit integration exists.

## Stack

Next.js 16 · App Router · Turbopack · TypeScript strict · Tailwind v4 ·
shadcn/ui (new-york) · React Hook Form · Zod · Supabase (`@supabase/ssr`) ·
Vitest · pnpm · Node ≥24.22.1

This app uses Server Components and Server Actions. The unused scaffold dependency `@tanstack/react-query` was removed after source, test and tooling reference checks.

## Commands

```bash
pnpm dev          # dev server — http://localhost:3000
pnpm build        # production build
pnpm test         # run test suite (vitest)
pnpm test:e2e     # playwright public smoke + auth guard (no live database)
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm check        # prettier --check + eslint + tsc --noEmit + route-logging check
pnpm format       # prettier --write
```

Playwright covers a public smoke only (`e2e/`: landing, login and the
signed-out auth guard); there is no e2e coverage of signed-in flows.
Component behavior (anything rendered with Testing Library +
jsdom) is covered by `*.dom.test.tsx` files; plain logic/schema/lib tests
use `*.test.ts`/`*.test.tsx` — same convention as qkit/loopkit. Auth,
dashboard, and products all have real coverage now; it's not yet
comprehensive everywhere (mutation testing, `db` RLS-adjacent coverage,
and a few older paths are still ahead of it).

## File Layout

Source tree map: `docs/FILE-LAYOUT.md`.

## Data model

Full schema notes: `docs/DATA-MODEL.md`. Rules that bind every change:

- `stock_movements` is an append-only ledger (no update/delete RLS policy,
  immutable even to the row's owner). `admin_audit` is likewise never updated
  or deleted; the service-role client has no `update`/`delete` grant on
  either table (`0015_audit_immutability.sql`).
- The only write path for a stock change is `stockkit.record_stock_movement`
  (SECURITY INVOKER, atomic, rejects a move below zero).
- RLS: a vendor sees/edits only their own `vendors`, `products` and
  `stock_movements` rows. No public read of anything.
- **Retention: keep `admin_audit` and `stock_movements` rows for 5 years**
  (IRAS norm for a small Singapore business); no purge job exists yet.

## Rules (always)

- TypeScript strict — no `any`, no `@ts-ignore`.
- Validate all user input with Zod at every boundary (forms + server actions).
- Authorization lives in **RLS policies**, not in app code. Never widen a
  policy to "fix" a query — fix the query or the session instead.
- Use the **service-role client** (`createServiceClient`) only in Server
  Actions / Route Handlers, never in client components, and only when a task
  genuinely needs to bypass RLS — none of the current vendor-owned writes do;
  they all go through the RLS-scoped `createServerClient()`.
- No secrets in `NEXT_PUBLIC_*`. `NEXT_PUBLIC_SUPABASE_*` are inlined at
  build time — rebuild after changing them.
- `@supabase/ssr` and `@supabase/supabase-js` versions must stay compatible
  (check `package.json`, not this number, since both get bumped) or every
  query degrades to `never`.
- After editing the schema, update both `supabase/migrations/` and
  `src/lib/types.ts` (or regenerate via `supabase gen types typescript`).
- Comment hygiene: own-line comments only (no trailing inline comments),
  enforced by `no-inline-comments: error`; no committed dead/commented-out
  code, enforced by `sonarjs/no-commented-code: error`.
- `font-mono` on every quantity/cost figure shown to the vendor — the app's
  one deliberate typographic signature (a "ledger" motif). Don't drop it on
  new numeric displays.

The templateCentral 6.0.4 and 7.2.2 adoption reviews (2026-10-12, 2026-11-04) — what was adopted and
what was not — is in `docs/meta/templatecentral-adoption-log.md`.

## AI Harness

PreToolUse(Read|Edit|Write): normalize Windows and relative paths; hard-block
secret-file reads and writes (environment files except the blank templates,
secret directories and certificate/credential files). Governance and CI/CD
writes require human approval; their reads are allowed. Ordinary application
code, skills and specifications remain unrestricted. The Bash guard continues
to block hook bypasses, protected-branch force pushes and destructive guard edits.
UserPromptSubmit: credential-shaped input is blocked; injection-phrase matches
produce advisory context so quoted security research can proceed.
PostToolUse: `tsc --noEmit --incremental` after every Edit/Write. Feedback-only.
Stop: exits 0 when `stop_hook_active` (no re-entry loop); else runs the test
suite, exit 2 feeds failures back, exit 0 on pass.
SessionStart (startup|resume|compact): prints the always-on invariants only (AGENTS.md loads through the `CLAUDE.md` import).
`permissions`: max-privilege — bare-tool `allow` (Bash/Read/Edit/Write/web/Skill/
Task) so common work doesn't prompt; `deny` covers secret reads/edits and
irreversible ops (`rm -rf`, `git push --force`/`-f`, `git reset --hard`,
`git clean -fd/-fx`, `git filter-branch`, ref-delete). `ask` gates `Edit(...)`
on the medium-security governance files: `AGENTS.md`, `CLAUDE.md`,
`.claude/harness.json`, `.claude/settings.json`, `.claude/settings.local.json`.
Deny always wins; it's a guardrail, not a sandbox.
Git hooks (husky): pre-commit runs format/lint/typecheck + gitleaks
secret-scan on staged files, plus a readme-coupling staleness warning;
commit-msg enforces Conventional Commits; pre-push runs the harness
integrity check + quality gate. Migrated 2026-08-01 off lefthook, whose
unsigned `lefthook.exe` Windows Smart App Control blocks unconditionally —
see `docs/superpowers/specs/2026-08-01-lefthook-to-husky-migration-design.md`.
CI (GitHub Actions): hard gate on changed-line coverage (`diff-cover`
≥80%), lockfile-in-sync (`--frozen-lockfile`), a changelog-touched check, a
readme-freshness check, harness integrity, a `db` job (pgTAP RLS suite), and
(via `security.yml`) a full-history gitleaks scan + the fail-closed deps gate `.claude/deps-gate.sh` (`pnpm audit` high/critical; expiring suppressions only in `.claude/dep-audit-allow.txt`) + a
dormant self-skipping CodeQL job. An `e2e` job ("e2e (public smoke)") runs
the Playwright specs in `e2e/`. No `mutation` job (no Stryker config), out of
scope for this pass.
RLS isolation: `supabase/tests/rls.test.sql` via `supabase test db`.
Project skills (directory form, `<name>/SKILL.md`): `.claude/skills/` (`next-verify`, `supabase-migrate`) |
Manifest: `.claude/harness.json`

## Project-Specific Notes

- No live Supabase project is configured in the dev/CI environment this app
  was built in — `.env.local` has empty Supabase values on purpose, so
  `src/lib/supabase/env.ts`'s fail-fast check throws a clear error instead of
  the app silently misbehaving. Every page under `/dashboard` sets
  `export const revalidate = 0` so Next never tries to statically prerender a
  page that needs a real session/DB round-trip.
- The design accent is "Reefer Frost" (as of 2026-08-19) — a chilled
  cyan-teal (`oklch(0.496 0.075 207.4)`-ish, `#1f6e78`), replacing the
  earlier steel/cobalt blue, deliberately distinct from qkit's warm
  ember and loopkit's gold. Green/amber/red
  (`--stock-ok`/`--stock-low`/`--stock-out`) are reserved for
  stock-level status only — never reused as the brand accent.
