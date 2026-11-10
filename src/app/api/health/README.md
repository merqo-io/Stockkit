# health

## Purpose

Uptime probe for monitors and deploy checks.

## Contents

- `route.ts` — `GET /api/health` returns `{ status: 'ok', timestamp }` with HTTP 200 and no data access, wrapped in `withLogging`.

## Parent

[api](../README.md)
