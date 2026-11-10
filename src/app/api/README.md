# api

## Purpose

Route handlers served under `/api`.

## Contents

- `route.ts` — `GET /api`: JSON `{ status: 'ok', timestamp }`, wrapped in `withLogging`.
- `health/` — `GET /api/health`, the uptime probe (own README).
- `merqo/` — bearer-authenticated endpoints merqo calls (own README).

## Parent

[app](../README.md)
