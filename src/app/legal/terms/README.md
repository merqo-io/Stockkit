# terms

## Purpose

The public Terms of Service page.

## Contents

- `page.tsx` — `TermsPage`, a Server Component rendering (via
  `../legal-page-client.tsx`) `@merqo/ui`'s `<LegalPage doc="terms"
kit="stockkit" />` and exporting `legalPageMetadata("terms")` (tab title
  "Terms of Service"). The `kit`
  prop scopes the rendered Annex to stockkit's own schedule only, not
  every sibling kit's. Content lives in `@merqo/ui`, not here — see the
  parent README.

## Parent

[legal](../README.md)
