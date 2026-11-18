# DESIGN.md: stockkit

## Public pages

Public pages (landing, about, FAQ, legal) follow the shared rules at https://github.com/merqo-io/merqo-ui/blob/main/docs/public-page-rules.md. This section never restates them; it only adds stockkit's own values.

- **Radius:** `--radius` is `0.5rem` (`src/app/globals.css`). Surfaces use `rounded-lg`.
- **Product objects:** the product ledger card in the landing hero (`src/components/landing/ledger-card-preview.tsx`): name, stock-status dot and on-hand count. It is a mock, not real data.
- **Open:** nothing.
