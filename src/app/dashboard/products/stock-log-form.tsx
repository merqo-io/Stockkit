'use client';

import { STOCK_MOVEMENT_REASON_LABEL } from '@/lib/stock';

import { FORM_ERROR_CLASS, FORM_LABEL_CLASS, InfoTooltip, MoneyInput } from '@merqo/ui';
import { Minus, Plus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useAsyncAction } from '@/hooks';
import { stockMovementFormSchema } from '@/lib/schemas';
import type { Product } from '@/lib/types';
import {
  cn,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@merqo/ui/primitives';
import { recordStockMovement } from './actions';

type Reason = 'restock' | 'waste' | 'adjustment';

interface Props {
  product: Product;
  onRecorded: (product: Product) => void;
}

function submitLabel(reason: Reason, sign: 1 | -1, quantity: number, unit: string): string {
  let amount = String(quantity);
  if (reason === 'adjustment') amount = `${sign === 1 ? '+' : '-'}${quantity}`;
  return `Log ${reason} of ${amount} ${unit}`;
}

function resolveSign(reason: Reason, adjustmentSign: 1 | -1): 1 | -1 {
  if (reason === 'restock') return 1;
  if (reason === 'waste') return -1;
  return adjustmentSign;
}

/** Log a stock movement (in/out) for one product — the ledger write path. */
export function StockLogForm({ product, onRecorded }: Props) {
  const [reason, setReason] = useState<Reason>('restock');
  const [quantity, setQuantity] = useState(1);
  // Only meaningful for 'adjustment' — restock is always +, waste is always -.
  const [adjustmentSign, setAdjustmentSign] = useState<1 | -1>(1);
  const [note, setNote] = useState('');
  const [unitCostCents, setUnitCostCents] = useState<number | undefined>(product.unit_cost_cents);
  const [errors, setErrors] = useState<{ quantity?: string; cost?: string }>({});
  const { pending, run } = useAsyncAction();

  const sign = resolveSign(reason, adjustmentSign);

  function step(amount: number) {
    setQuantity((q) => Math.max(0, q + amount));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();

    const unit_cost_cents = reason === 'restock' ? unitCostCents : undefined;

    const candidate = {
      product_id: product.id,
      delta: sign * quantity,
      reason,
      note: note.trim() || undefined,
      unit_cost_cents,
    };
    const parsed = stockMovementFormSchema.safeParse(candidate);
    if (!parsed.success) {
      const next: { quantity?: string; cost?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === 'unit_cost_cents') next.cost ??= issue.message;
        else next.quantity ??= issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});

    return run(async () => {
      try {
        const result = await recordStockMovement(parsed.data);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success(`${STOCK_MOVEMENT_REASON_LABEL[reason]} logged`);
        setQuantity(1);
        setNote('');
        onRecorded(result.product);
      } catch {
        toast.error('Could not log the stock change. Try again.');
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="movement-reason" className={FORM_LABEL_CLASS}>
          Reason
        </Label>
        <Select value={reason} onValueChange={(v) => setReason(v as Reason)}>
          <SelectTrigger id="movement-reason" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="restock">Restock</SelectItem>
            <SelectItem value="waste">Waste</SelectItem>
            <SelectItem value="adjustment">Adjustment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {reason === 'adjustment' && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-pressed={adjustmentSign === 1}
            className={cn(adjustmentSign === 1 && 'border-foreground')}
            onClick={() => setAdjustmentSign(1)}
          >
            Add stock
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-pressed={adjustmentSign === -1}
            className={cn(adjustmentSign === -1 && 'border-foreground')}
            onClick={() => setAdjustmentSign(-1)}
          >
            Remove stock
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="movement-quantity" className={FORM_LABEL_CLASS}>
          Quantity
        </Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 rounded-lg"
            onClick={() => step(-1)}
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" />
          </Button>
          <Input
            id="movement-quantity"
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            className="h-11 w-24 text-center font-mono text-lg font-semibold tabular-nums"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(0, Number(e.target.value) || 0))}
            aria-invalid={Boolean(errors.quantity)}
            aria-describedby={errors.quantity ? 'movement-quantity-error' : undefined}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 rounded-lg"
            onClick={() => step(1)}
            aria-label="Increase quantity"
          >
            <Plus className="size-4" />
          </Button>
          <span className="text-muted-foreground text-sm">{product.unit}</span>
        </div>
        {errors.quantity && (
          <p id="movement-quantity-error" role="alert" className={FORM_ERROR_CLASS}>
            {errors.quantity}
          </p>
        )}
      </div>

      {reason === 'restock' && (
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="movement-unit-cost" className={FORM_LABEL_CLASS}>
              Unit cost this restock ($)
            </Label>
            <InfoTooltip
              content="Saved with this restock in the stock history only. It does not change the product's unit cost."
              ariaLabel="About cost on the ledger"
              trigger="tap"
            />
          </div>
          <MoneyInput
            id="movement-unit-cost"
            className="font-mono"
            cents={unitCostCents}
            onCommit={setUnitCostCents}
            aria-describedby={errors.cost ? 'movement-cost-error' : undefined}
          />
          {errors.cost && (
            <p id="movement-cost-error" role="alert" className={FORM_ERROR_CLASS}>
              {errors.cost}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="movement-note" className={FORM_LABEL_CLASS}>
          Note (optional)
        </Label>
        <Textarea
          id="movement-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Saving…' : submitLabel(reason, adjustmentSign, quantity, product.unit)}
      </Button>
    </form>
  );
}
