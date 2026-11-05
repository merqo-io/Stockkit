'use client';

import { useState } from 'react';

import { StockStatusIndicator } from '@/components/stock-status-indicator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { productStatusFor } from '@/lib/stock';
import type { Product } from '@/lib/types';
import { LEDGER_MD_CLASS } from '@/lib/utils';
import { ExportHistoryButton } from './export-history-button';
import { MovementHistory } from './movement-history';
import { ProductForm } from './product-form';
import { StockLogForm } from './stock-log-form';

interface Props {
  product: Product;
  // Kept so both the mobile dialog ('tabs') and the desktop panel
  // ('stacked') can size spacing differently; both render the same tabs.
  layout: 'tabs' | 'stacked';
  onSaved: (product: Product) => void;
}

/**
 * Full detail for a selected product: current status plus tabs for logging
 * stock, editing, and movement history. Shared between the mobile Dialog and
 * the desktop split-pane panel.
 */
export function ProductDetail({ product, layout, onSaved }: Props) {
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [historyCapped, setHistoryCapped] = useState<boolean | null>(null);
  const status = productStatusFor(product);

  function onRecorded(updated: Product) {
    onSaved(updated);
    setHistoryRefreshKey((k) => k + 1);
  }

  return (
    <div className={layout === 'stacked' ? 'space-y-6' : 'space-y-5'}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold">{product.name}</h2>
          <div className="mt-1 flex items-center gap-1.5">
            <StockStatusIndicator status={status} textClassName="text-sm" />
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className={LEDGER_MD_CLASS}>{product.on_hand}</p>
          <p className="text-muted-foreground text-xs">{product.unit} on hand</p>
        </div>
      </div>
      <Tabs defaultValue="stock">
        <TabsList className="w-full">
          <TabsTrigger value="stock" className="flex-1">
            Log stock
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex-1">
            Edit
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1">
            History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="stock" className="pt-4">
          <StockLogForm product={product} onRecorded={onRecorded} />
        </TabsContent>
        <TabsContent value="edit" className="pt-4">
          <ProductForm product={product} onSaved={onSaved} />
        </TabsContent>
        <TabsContent value="history" className="space-y-3 pt-4">
          <ExportHistoryButton productId={product.id} locked={historyCapped} />
          <MovementHistory
            productId={product.id}
            refreshKey={historyRefreshKey}
            onCappedChange={setHistoryCapped}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
