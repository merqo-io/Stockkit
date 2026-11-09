# src

## Purpose

The stockkit application source.

## Contents

- `app/`: the App Router tree (landing, vendor dashboard, admin console, auth, API routes).
- `components/`, `hooks/`, `lib/`: UI, shared hooks and domain logic.
- `proxy.ts`: Next 16 proxy. Refreshes the Supabase session, then sets the CSP (a per-request nonce on dynamic routes, the static policy elsewhere) and `X-Robots-Tag` off production. It is the shared `createProxy`; `lib/nonce-prefixes.ts` lists the nonce routes.

## Parent

[Stockkit](../README.md)
