# faq

## Purpose

The public `/faq` page. Under `(public)` so `layout.tsx` supplies the
`Nav`, `SiteFooter` and session check; `FaqPage` renders neither.

## Contents

- `page.tsx` renders `@merqo/ui`'s `FaqPage` with the title, intro and
  groups from `faq-content.ts`. No closing line is passed. FAQ JSON-LD is
  left on.
- `faq-content.ts` holds the title, intro and three groups. The pricing row
  reuses `PRICING_LINE` from `src/components/landing/faq.tsx`.
- `page.dom.test.tsx` covers the rendered headings and questions, the
  settled answer wording, the absent closing line and copy guardrails.

The landing page keeps its own short FAQ section.
