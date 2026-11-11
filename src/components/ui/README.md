# ui

## Purpose

Local shadcn/ui (new-york style) primitives that have no identical shared version.
The rest (badge, card, dialog, input, label, select, switch, textarea, checkbox,
tooltip) and `cn` are imported from `@merqo/ui/primitives`; do not re-add local copies.

## Contents

- `button.tsx` — `Button` (cva variants/sizes), `asChild`-capable via Radix `Slot`; the outline variant is flat (no shadow). Coarse-pointer 44px minimums for buttons, inputs, selects, tab triggers and the dialog close live in `src/app/globals.css` (keyed on `data-slot`/`data-variant`), not in these class strings
- `command.tsx` — `cmdk`-backed `Command`/`CommandInput`/`CommandList`/`CommandEmpty`/`CommandGroup`/`CommandItem`; paired with `Popover` from `@merqo/ui/primitives` to build the products form's unit combobox (`product-form.tsx`)
- `tabs.tsx` — Radix `Tabs` wrapper

## Parent

[components](../README.md)
