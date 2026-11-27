import type { ReactNode } from 'react';

import { formatMoney } from '@merqo/ui';

import {
  ADD_PRODUCT_BUTTON,
  FIELD_NAME,
  FIELD_QUANTITY,
  FIELD_REASON,
  FIELD_STARTING_QUANTITY,
  FIELD_THRESHOLD,
  FIELD_UNIT,
  FIELD_UNIT_COST,
  INVENTORY_VALUE,
  LOW_AT,
  LOW_STOCK,
  NEEDS_ATTENTION,
  onHand,
  OUT_OF_STOCK,
  OVERVIEW_TITLE,
  REASON_RESTOCK,
  RESTOCK_LOGGED,
  SAMPLE,
  STATUS_LOW,
} from './stock-labels';

const TITLE = 'text-[11px] font-semibold leading-tight';
const MUTED = 'text-[10px] leading-tight text-muted-foreground';
const FIELD = 'flex h-7 items-center rounded-lg border px-2 text-[11px]';

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <p className={MUTED}>{label}</p>
      <div className={FIELD}>
        <span className={mono ? 'truncate font-mono' : 'truncate'}>{value}</span>
        {value === '' ? <span aria-hidden>&nbsp;</span> : null}
      </div>
    </div>
  );
}

/** Number of fields filled, 0 to 3, mirrors the scroll-driven frames. */
export function AddProductScreen({ filled, action }: { filled: number; action: ReactNode }) {
  const s = SAMPLE;
  return (
    <div className="flex h-full flex-col gap-1.5">
      <p className={TITLE}>{ADD_PRODUCT_BUTTON}</p>
      <Field label={FIELD_NAME} value={s.name} />
      <div className="grid grid-cols-2 gap-1.5">
        <Field label={FIELD_UNIT} value={filled >= 1 ? s.unit : ''} />
        <Field label={FIELD_UNIT_COST} value={filled >= 1 ? s.unitCost : ''} mono />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <Field
          label={FIELD_STARTING_QUANTITY}
          value={filled >= 2 ? String(s.startQuantity) : ''}
          mono
        />
        <Field label={FIELD_THRESHOLD} value={filled >= 3 ? String(s.threshold) : ''} mono />
      </div>
      <div className="mt-auto">{action}</div>
    </div>
  );
}

export function RestockScreen({ done, action }: { done: boolean; action: ReactNode }) {
  const s = SAMPLE;
  const total = done ? s.startQuantity + s.restockQuantity : s.startQuantity;
  return (
    <div className="flex h-full flex-col gap-1.5">
      <div className="flex items-start justify-between gap-2">
        <p className={TITLE}>{s.name}</p>
        <div className="text-right">
          <p className="font-mono text-base leading-none font-semibold tabular-nums">{total}</p>
          <p className={MUTED}>{onHand(s.unit)}</p>
        </div>
      </div>
      <Field label={FIELD_REASON} value={REASON_RESTOCK} />
      <Field label={FIELD_QUANTITY} value={String(s.restockQuantity)} mono />
      {done ? <p className="text-[11px] font-semibold">{RESTOCK_LOGGED}</p> : null}
      <div className="mt-auto">{action}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border px-2 py-1.5">
      <p className={MUTED}>{label}</p>
      <p className="font-mono text-sm leading-tight font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function OverviewScreen({ low }: { low: boolean }) {
  const s = SAMPLE;
  const onHandNow = low ? s.lowOnHand : s.startQuantity;
  return (
    <div className="flex h-full flex-col gap-1.5">
      <p className={TITLE}>{OVERVIEW_TITLE}</p>
      <Stat label={INVENTORY_VALUE} value={formatMoney(onHandNow * s.unitCostCents)} />
      <div className="grid grid-cols-2 gap-1.5">
        <Stat label={LOW_STOCK} value={low ? '1' : '0'} />
        <Stat label={OUT_OF_STOCK} value="0" />
      </div>
      {low ? (
        <div className="space-y-1">
          <p className={TITLE}>{NEEDS_ATTENTION}</p>
          <div className="flex items-center justify-between gap-1 rounded-lg border px-2 py-1.5">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium">{s.name}</p>
              <p className={MUTED}>
                {LOW_AT} <span className="font-mono">{s.threshold}</span> {s.unit}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className={MUTED}>{STATUS_LOW}</p>
              <p className="font-mono text-[11px] font-semibold tabular-nums">
                {s.lowOnHand} {s.unit}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
