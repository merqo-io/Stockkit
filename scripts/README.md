# scripts

## Purpose

Repo tooling run outside the app.

## Contents

- `check-route-logging.mjs` fails `pnpm check` when an App Router API handler under `src/app/api` is not wrapped in `withLogging()`.
- `staging-migrate.sh` applies `supabase/migrations` to the shared staging Supabase project with psql, one transaction per file. Run it inside `postgres:17.6-alpine` with the repo mounted at `/repo` (merqo's `docs/STAGING.md`). With no arguments it bootstraps every file and refuses if the `stockkit` schema already exists; with file arguments it applies only those, for the staging-first migration gate.

## Parent

[stockkit](../README.md)
