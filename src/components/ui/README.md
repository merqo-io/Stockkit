# ui

## Purpose

Local shadcn/ui (new-york style) primitives that have no identical shared version.
The rest (tabs, badge, card, dialog, input, label, select, switch, textarea, checkbox,
tooltip) and `cn` are imported from `@merqo/ui/primitives`; do not re-add local copies.

## Contents

- No `button.tsx`: `Button` comes from `@merqo/ui/primitives`, which sizes every button to 44px (48px `lg`) on coarse pointers itself.
- `command.tsx` — `cmdk`-backed `Command`/`CommandInput`/`CommandList`/`CommandEmpty`/`CommandGroup`/`CommandItem`; paired with `Popover` from `@merqo/ui/primitives` to build the products form's unit combobox (`product-form.tsx`)

## Parent

[components](../README.md)
