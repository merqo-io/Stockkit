import { STOCK_STATUS_DOT_CLASS, STOCK_STATUS_LABEL, type ProductStatus } from '@/lib/stock';
import { cn } from '@merqo/ui/primitives';

export const STOCK_INDICATOR_DOT_CLASS = 'size-2 shrink-0 rounded-full';
export const STOCK_INDICATOR_TEXT_CLASS = 'text-muted-foreground';

/** Dot + label pair, shared by every place a product's stock status is shown. */
export function StockStatusIndicator({
  status,
  textClassName = 'text-xs',
}: {
  status: ProductStatus;
  textClassName?: string;
}) {
  return (
    <>
      <span className={cn(STOCK_INDICATOR_DOT_CLASS, STOCK_STATUS_DOT_CLASS[status])} />
      <span className={cn(STOCK_INDICATOR_TEXT_CLASS, textClassName)}>
        {STOCK_STATUS_LABEL[status]}
      </span>
    </>
  );
}
