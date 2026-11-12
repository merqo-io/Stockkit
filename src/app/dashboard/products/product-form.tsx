'use client';

import { ConfirmDialog, FORM_LABEL_CLASS, FormError, InfoTooltip, MoneyInput } from '@merqo/ui';
import { Archive, ArchiveRestore, Check, ChevronsUpDown } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useAsyncAction } from '@/hooks';
import { productFormSchema, type ProductFormInput } from '@/lib/schemas';
import type { Product } from '@/lib/types';
import { cn, Input, Label, Popover, PopoverContent, PopoverTrigger } from '@merqo/ui/primitives';
import { archiveProduct, saveProduct } from './actions';

const UNIT_PRESETS = ['unit', 'kg', 'g', 'L', 'mL', 'box', 'pack', 'case'];

function submitLabel(saving: boolean, isNew: boolean) {
  if (saving) return 'Saving…';
  return isNew ? 'Add product' : 'Save changes';
}

type FieldKey = 'name' | 'unit' | 'unit_cost_cents' | 'on_hand' | 'low_stock_threshold';

const FIELD_KEYS: readonly string[] = [
  'name',
  'unit',
  'unit_cost_cents',
  'on_hand',
  'low_stock_threshold',
];

function fieldErrors(
  issues: readonly { path: readonly PropertyKey[]; message: string }[]
): Partial<Record<FieldKey, string>> {
  const out: Partial<Record<FieldKey, string>> = {};
  for (const issue of issues) {
    const key = String(issue.path[0]);
    if (FIELD_KEYS.includes(key) && !out[key as FieldKey]) out[key as FieldKey] = issue.message;
  }
  return out;
}

function UnitPicker({
  unit,
  onChange,
  errorId,
}: {
  unit: string;
  onChange: (unit: string) => void;
  errorId?: string;
}) {
  const [unitOpen, setUnitOpen] = useState(false);
  return (
    <Popover open={unitOpen} onOpenChange={setUnitOpen}>
      <PopoverTrigger asChild>
        <Button
          id="product-unit"
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={unitOpen}
          aria-describedby={errorId}
          className="w-full justify-between font-normal"
        >
          {unit || 'Select unit'}
          <ChevronsUpDown className="text-muted-foreground size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search or enter a unit…"
            value={unit}
            onValueChange={onChange}
          />
          <CommandList>
            <CommandEmpty className="text-muted-foreground px-3 py-6 text-center text-sm">
              No matching unit
            </CommandEmpty>
            {unit.trim() &&
              !UNIT_PRESETS.some((u) => u.toLowerCase() === unit.trim().toLowerCase()) && (
                <CommandGroup heading="Custom">
                  <CommandItem value={unit} onSelect={() => setUnitOpen(false)}>
                    <Check className="size-4 opacity-0" />
                    Use &ldquo;{unit}&rdquo;
                  </CommandItem>
                </CommandGroup>
              )}
            <CommandGroup heading="Suggestions">
              {UNIT_PRESETS.map((u) => (
                <CommandItem
                  key={u}
                  value={u}
                  onSelect={(value) => {
                    onChange(value);
                    setUnitOpen(false);
                  }}
                >
                  <Check className={cn('size-4', unit === u ? 'opacity-100' : 'opacity-0')} />
                  {u}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function savedProduct(existing: Product | undefined, input: ProductFormInput, id: string): Product {
  const now = new Date().toISOString();
  return {
    id,
    vendor_id: existing?.vendor_id ?? '',
    name: input.name,
    unit: input.unit,
    unit_cost_cents: input.unit_cost_cents,
    on_hand: existing ? existing.on_hand : input.on_hand,
    low_stock_threshold: input.low_stock_threshold,
    is_active: input.is_active,
    created_at: existing?.created_at ?? now,
    updated_at: now,
  };
}

interface Props {
  product?: Product;
  onSaved: (product: Product) => void;
  onCancel?: () => void;
}

function initialDraft(product: Product | undefined) {
  return {
    name: product?.name ?? '',
    unit: product?.unit ?? 'unit',
    unitCostCents: product?.unit_cost_cents ?? 0,
    onHand: String(product?.on_hand ?? 0),
    lowStockThreshold: String(product?.low_stock_threshold ?? 0),
  };
}

/** Create/edit form. Starting quantity is only editable when creating a new
 * product — once a product exists, its on_hand only ever moves through the
 * Log stock form (StockLogForm), never a direct edit. */
export function ProductForm({ product, onSaved, onCancel }: Props) {
  const isNew = !product;
  const initial = initialDraft(product);
  const [name, setName] = useState(initial.name);
  const [unit, setUnit] = useState(initial.unit);
  const [unitCostCents, setUnitCostCents] = useState<number | undefined>(initial.unitCostCents);
  const [onHand, setOnHand] = useState(initial.onHand);
  const [lowStockThreshold, setLowStockThreshold] = useState(initial.lowStockThreshold);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const { pending: saving, run: runSave } = useAsyncAction();
  const { pending: archiving, run: runArchive } = useAsyncAction();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    return save(product?.is_active ?? true);
  }

  function save(isActive: boolean) {
    let savedMessage = isNew ? 'Product added' : 'Product saved';
    if (isActive && product?.is_active === false) savedMessage = 'Product restored';
    const candidate = {
      id: product?.id,
      name,
      unit,
      unit_cost_cents: unitCostCents ?? 0,
      on_hand: Number(onHand),
      low_stock_threshold: Number(lowStockThreshold),
      is_active: isActive,
    };
    const parsed = productFormSchema.safeParse(candidate);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error.issues));
      return;
    }
    setErrors({});

    return runSave(async () => {
      try {
        const result = await saveProduct(parsed.data);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success(savedMessage);
        onSaved(savedProduct(product, parsed.data, result.productId));
      } catch {
        toast.error('Could not save the product. Try again.');
      }
    });
  }

  function onArchive() {
    if (!product) return;
    return runArchive(async () => {
      try {
        const result = await archiveProduct(product.id);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success('Product archived');
        onSaved({ ...product, is_active: false });
      } catch {
        toast.error('Could not archive the product. Try again.');
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="product-name" className={FORM_LABEL_CLASS}>
          Name
        </Label>
        <Input
          id="product-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Chicken thigh"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'product-name-error' : undefined}
        />
        <FormError id="product-name-error" message={errors.name} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="product-unit" className={FORM_LABEL_CLASS}>
            Unit
          </Label>
          <UnitPicker
            unit={unit}
            onChange={setUnit}
            errorId={errors.unit ? 'product-unit-error' : undefined}
          />
          <FormError id="product-unit-error" message={errors.unit} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-cost" className={FORM_LABEL_CLASS}>
            Unit cost ($)
          </Label>
          <MoneyInput
            id="product-cost"
            className="font-mono"
            cents={unitCostCents}
            onCommit={setUnitCostCents}
            aria-describedby={errors.unit_cost_cents ? 'product-cost-error' : undefined}
          />
          <FormError id="product-cost-error" message={errors.unit_cost_cents} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {isNew && (
          <div className="space-y-2">
            <Label htmlFor="product-on-hand" className={FORM_LABEL_CLASS}>
              Starting quantity
            </Label>
            <Input
              id="product-on-hand"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              className="font-mono"
              value={onHand}
              onChange={(e) => setOnHand(e.target.value)}
              aria-invalid={Boolean(errors.on_hand)}
              aria-describedby={errors.on_hand ? 'product-on-hand-error' : undefined}
            />
            <FormError id="product-on-hand-error" message={errors.on_hand} />
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="product-threshold" className={FORM_LABEL_CLASS}>
              Low-stock threshold
            </Label>
            <InfoTooltip
              content="The product shows as low stock once its quantity drops to this number or below. Leave it at 0 to flag it only when it runs out."
              ariaLabel="About low-stock threshold"
              trigger="tap"
            />
          </div>
          <Input
            id="product-threshold"
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            className="font-mono"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
            aria-invalid={Boolean(errors.low_stock_threshold)}
            aria-describedby={errors.low_stock_threshold ? 'product-threshold-error' : undefined}
          />
          <FormError id="product-threshold-error" message={errors.low_stock_threshold} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" className="flex-1" disabled={saving}>
          {submitLabel(saving, isNew)}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        )}
      </div>

      {product && !product.is_active && (
        <div className="space-y-2 rounded-lg border p-4">
          <p className="text-xs font-semibold tracking-wider uppercase">Restore product</p>
          <p className="text-muted-foreground text-sm">
            This product is archived. Restoring it puts it back in active inventory.
          </p>
          <Button type="button" variant="outline" disabled={saving} onClick={() => save(true)}>
            <ArchiveRestore className="size-4" />
            Restore product
          </Button>
        </div>
      )}

      {product?.is_active && (
        <div className="border-destructive/30 bg-destructive/[0.03] space-y-2 rounded-lg border p-4">
          <p className="text-destructive text-xs font-semibold tracking-wider uppercase">
            Archive product
          </p>
          <p className="text-muted-foreground text-sm">
            Archiving keeps stock history and removes the product from active inventory.
          </p>
          <ConfirmDialog
            trigger={
              <Button
                type="button"
                variant="outline"
                className="border-destructive/40 text-destructive hover:bg-destructive hover:text-white"
                disabled={archiving || saving}
              >
                <Archive className="size-4" />
                {archiving ? 'Archiving…' : 'Archive product'}
              </Button>
            }
            title={<>Archive &ldquo;{product?.name}&rdquo;?</>}
            description="You can restore it later from its Edit tab. Its stock history stays available."
            confirmLabel="Archive product"
            cancelLabel="Keep product"
            pendingLabel="Archiving…"
            variant="destructive"
            onConfirm={onArchive}
          />
        </div>
      )}
    </form>
  );
}
