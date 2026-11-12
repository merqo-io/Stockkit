'use client';

import { Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { productStatusFor } from '@/lib/stock';
import type { Product } from '@/lib/types';
import { EmptyState, PageHeader, SegmentedControl } from '@merqo/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
} from '@merqo/ui/primitives';
import { ProductDetail } from './product-detail';
import { ProductForm } from './product-form';
import { ProductRow } from './product-row';

interface Props {
  initialProducts: Product[];
  // The plan's active-product cap; null or omitted means unlimited, so no meter.
  maxActiveProducts?: number | null;
  initialSelectedId?: string | null;
}

type MobileDialogState = { kind: 'product'; productId: string } | { kind: 'new' } | null;

type Filter = 'all' | 'low' | 'out' | 'archived';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'low', label: 'Low' },
  { value: 'out', label: 'Out' },
  { value: 'archived', label: 'Archived' },
] as const;

const DESKTOP_QUERY = '(min-width: 768px)';

// Tailwind's md breakpoint. Without matchMedia (tests, old browsers) the
// desktop two-pane flow is the safe default.
function isDesktop(): boolean {
  return typeof window.matchMedia !== 'function' || window.matchMedia(DESKTOP_QUERY).matches;
}

function matchesFilter(product: Product, filter: Filter): boolean {
  const status = productStatusFor(product);
  if (filter === 'all') return status !== 'archived';
  return status === filter;
}

/**
 * Products list + detail. One list drives both breakpoints: below md a row
 * tap opens a Dialog, at md+ the detail panel sits beside the list. Selection
 * and save state live here once (mirrors the "server passes `initial` data,
 * client owns state" pattern from qkit's booth-form.tsx).
 */
export function ProductsWorkspace({
  initialProducts,
  maxActiveProducts = null,
  initialSelectedId = null,
}: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [mode, setMode] = useState<'view' | 'new'>('view');
  const [mobileDialog, setMobileDialog] = useState<MobileDialogState>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  // Server actions revalidatePath, which re-fetches this page's server data
  // and passes a fresh `initialProducts` array down — sync local state to it.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync local state to the revalidated server prop
    setProducts(initialProducts);
  }, [initialProducts]);

  const selected = products.find((p) => p.id === selectedId) ?? null;
  const activeCount = products.filter((p) => p.is_active).length;
  const needle = query.trim().toLowerCase();
  const visible = products.filter(
    (p) => matchesFilter(p, filter) && (needle === '' || p.name.toLowerCase().includes(needle))
  );

  function upsertLocal(product: Product) {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx === -1) return [...prev, product].sort((a, b) => a.name.localeCompare(b.name));
      const next = [...prev];
      next[idx] = product;
      return next;
    });
  }

  function onProductSaved(product: Product) {
    upsertLocal(product);
    setSelectedId(product.id);
    setMode('view');
    setMobileDialog(null);
  }

  function selectProduct(productId: string) {
    setSelectedId(productId);
    setMode('view');
    if (!isDesktop()) setMobileDialog({ kind: 'product', productId });
  }

  function startNew() {
    setMode('new');
    if (isDesktop()) setSelectedId(null);
    else setMobileDialog({ kind: 'new' });
  }

  function renderDetailPanel() {
    if (mode === 'new') {
      return <ProductForm onSaved={onProductSaved} onCancel={() => setMode('view')} />;
    }
    if (selected) {
      return (
        <ProductDetail
          key={selected.id}
          product={selected}
          layout="stacked"
          onSaved={onProductSaved}
        />
      );
    }
    return (
      <div className="flex min-h-[240px] items-center justify-center text-center">
        <p className="text-muted-foreground text-sm">
          Select a product to log stock or see its history.
        </p>
      </div>
    );
  }

  function renderList() {
    if (products.length === 0) {
      return (
        <EmptyState
          title="No products yet"
          description="Add your first product to start tracking stock."
        />
      );
    }
    if (visible.length === 0) {
      return (
        <EmptyState
          title="No matching products"
          description="Try another search or switch the filter."
        />
      );
    }
    return (
      <div className="space-y-2">
        {visible.map((p) => (
          <ProductRow
            key={p.id}
            product={p}
            selected={p.id === selectedId && mode === 'view'}
            onClick={() => selectProduct(p.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <PageHeader eyebrow="Inventory" title="Products" responsive className="mb-0">
            {products.length} product{products.length === 1 ? '' : 's'}
          </PageHeader>
        </div>
        <Button onClick={startNew} className="self-start sm:self-auto">
          <Plus className="size-4" />
          Add product
        </Button>
      </div>

      {products.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SegmentedControl
              ariaLabel="Filter products"
              options={FILTER_OPTIONS}
              value={filter}
              onChange={setFilter}
            />
            <div className="relative sm:w-64">
              <Search
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                type="search"
                aria-label="Search products"
                placeholder="Search products"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          {maxActiveProducts !== null && (
            <div>
              <p className="text-muted-foreground text-xs">
                <span className="text-foreground font-mono tabular-nums">{activeCount}</span> of{' '}
                <span className="text-foreground font-mono tabular-nums">{maxActiveProducts}</span>{' '}
                active
              </p>
              <div
                role="meter"
                aria-label="Active products used"
                aria-valuemin={0}
                aria-valuemax={maxActiveProducts}
                aria-valuenow={Math.min(activeCount, maxActiveProducts)}
                className="bg-muted mt-1 h-1 w-full max-w-48 overflow-hidden rounded-full"
              >
                <div
                  className="bg-primary h-full"
                  style={{
                    width: `${Math.min(100, (activeCount / maxActiveProducts) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,42%)_1fr]">
        <div>{renderList()}</div>
        <div className="border-border bg-card hidden self-start rounded-xl border p-6 md:block">
          {renderDetailPanel()}
        </div>
      </div>

      {/* Mobile dialog — add / log / edit / history */}
      <Dialog open={mobileDialog !== null} onOpenChange={(open) => !open && setMobileDialog(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          {mobileDialog?.kind === 'new' && (
            <>
              <DialogHeader>
                <DialogTitle>Add product</DialogTitle>
                <DialogDescription>Add a new product to track.</DialogDescription>
              </DialogHeader>
              <ProductForm onSaved={onProductSaved} />
            </>
          )}
          {mobileDialog?.kind === 'product' && selected && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>
                  Log stock, edit, or view history for {selected.name}.
                </DialogDescription>
              </DialogHeader>
              <ProductDetail
                key={selected.id}
                product={selected}
                layout="tabs"
                onSaved={onProductSaved}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
