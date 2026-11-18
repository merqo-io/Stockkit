# DESIGN.md: stockkit

## Public pages

Public pages (landing, about, FAQ, legal) follow the shared rules at https://github.com/merqo-io/merqo-ui/blob/main/docs/public-page-rules.md. This section never restates them; it only adds stockkit's own values.

- **Radius:** `--radius` is `0.5rem` (`src/app/globals.css`). Surfaces use `rounded-lg`.
- **Product objects:** the product ledger card in the landing hero (`src/components/landing/ledger-card-preview.tsx`): name, stock-status dot and on-hand count. It is a mock, not real data.
- **Open:**
  - `src/components/landing/how-it-works.tsx:31` and `src/components/landing/ledger-card-preview.tsx:34`: `ElevatedCard` from `@merqo/ui` is `rounded-2xl` with `shadow-md` on page content.
  - `src/components/landing/how-it-works.tsx:33`: the step cards lift on hover (`hover:-translate-y-1`).
  - `src/components/landing/benefits.tsx:27`: the benefits list is `rounded-2xl`.
  - `src/components/landing/hero.tsx:15`, `src/components/landing/hero.tsx:39`, `src/components/landing/benefits.tsx:27`, `src/components/landing/how-it-works.tsx:33`: the `fade-rise` load-time animation (`src/app/globals.css:218`) runs on page content.
  - `src/components/landing/ledger-card-preview.tsx:25`: the ledger card's activity row cycles every four seconds with no product event behind it.
