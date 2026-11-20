'use client';
import { Lock } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { DownloadButton, downloadBlob } from '@merqo/ui';
import { exportProductMovementsCsv } from './actions';

interface Props {
  productId: string;
  // True on the Free plan, where export is unavailable. null while the plan
  // is unknown or failed to load, which keeps the control disabled.
  locked?: boolean | null;
}

export function ExportHistoryButton({ productId, locked = false }: Props) {
  const [error, setError] = useState<string | null>(null);
  async function download() {
    setError(null);
    const result = await exportProductMovementsCsv(productId);
    if (!result.success) {
      setError(result.error);
      return;
    }
    downloadBlob(new Blob([result.csv], { type: 'text/csv;charset=utf-8' }), 'stock-history.csv');
  }
  function onError() {
    setError('Could not download the CSV. Try again.');
  }
  if (locked === null) {
    return (
      <Button type="button" variant="outline" size="sm" disabled>
        Download CSV
      </Button>
    );
  }
  if (locked) {
    return (
      <Button type="button" variant="outline" size="sm" disabled>
        <Lock className="size-3.5" aria-hidden="true" />
        Download CSV
        <span className="sr-only">(not available yet)</span>
      </Button>
    );
  }
  return (
    <div>
      <DownloadButton
        label="Download CSV"
        pendingLabel="Preparing…"
        onDownload={download}
        onError={onError}
      />
      {error && (
        <p role="alert" className="text-destructive mt-2 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
