# docs

- `FILE-LAYOUT.md` — source tree map, moved out of `AGENTS.md`.
- `DATA-MODEL.md` — full schema and RLS notes, moved out of `AGENTS.md`.
- `DATA-MODEL.md` also covers the `vendor_entitlements` cache (merqo's pushed plan) that replaced `vendors.plan` and `pricing`. Migration `0028` removed the prod-only `product_components` objects.
- `FILE-LAYOUT.md` lists no kit-local copies of shared pieces; `merqoNoLocalCopies` in `eslint.config.mjs` enforces that.
- `meta/` — standing backlog, specs and the templateCentral adoption log.
- `audits/`, `security/`, `superpowers/` — audit findings, security notes and per-feature specs and plans.
