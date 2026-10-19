'use client';

import { STOCK_MOVEMENT_REASON_LABEL } from '@/lib/stock';

import { InfoTooltip, MoneyInput } from '@merqo/ui';
import { Minus, Plus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAsyncAction } from '@/hooks';
import { stockMovementFormSchema } from '@/lib/schemas';
import type { Product } from '@/lib/types';
import { recordStockMovement } from './actions';

type Reason = 'restock' | 'waste' | 'adjustment';

interface Props {
  product: Product;
  onRecorded: (product: Product) => void;
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
      toast.error(parsed.error.issues[0]?.message ?? 'Check the movement details');
      return;
    }

    return run(async () => {
      try {
        const result = await recordStockMovement(parsed.data);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success(`${STOCK_MOVEMENT_REASON_LABEL[reason]} recorded`);
        setQuantity(1);
        setNote('');
        onRecorded(result.product);
      } catch {
        toast.error('Something went wrong. Please try again.');
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="movement-reason">Reason</Label>
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
            variant={adjustmentSign === 1 ? 'default' : 'outline'}
            onClick={() => setAdjustmentSign(1)}
          >
            Add stock
          </Button>
          <Button
            type="button"
            size="sm"
            variant={adjustmentSign === -1 ? 'default' : 'outline'}
            onClick={() => setAdjustmentSign(-1)}
          >
            Remove stock
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <Label>Quantity</Label>
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
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            className="h-11 w-24 text-center font-mono text-lg font-semibold tabular-nums"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(0, Number(e.target.value) || 0))}
            aria-label="Quantity"
          />
          <Button
            type="button"
            size="icon"
            className="size-11 rounded-lg"
            onClick={() => step(1)}
            aria-label="Increase quantity"
          >
            <Plus className="size-4" />
          </Button>
          <span className="text-muted-foreground text-sm">{product.unit}</span>
        </div>
      </div>

      {reason === 'restock' && (
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="movement-unit-cost">Unit cost this restock ($)</Label>
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
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="movement-note">Note (optional)</Label>
        <Textarea
          id="movement-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending || quantity <= 0}>
        {pending
          ? 'Saving…'
          : `${STOCK_MOVEMENT_REASON_LABEL[reason]} · ${quantity} ${product.unit}`}
      </Button>
    </form>
  );
}
