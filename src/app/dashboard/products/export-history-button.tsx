'use client';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { exportProductMovementsCsv } from './actions';

interface Props {
  productId: string;
  // True on the Free plan, where export is unavailable.
  locked?: boolean;
}

export function ExportHistoryButton({ productId, locked = false }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function download() {
    setPending(true);
    setError(null);
    let url: string | undefined;
    try {
      const result = await exportProductMovementsCsv(productId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      url = URL.createObjectURL(new Blob([result.csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'stock-history.csv';
      document.body.appendChild(link);
      try {
        link.click();
      } finally {
        link.remove();
      }
    } catch {
      setError('Could not download the CSV. Try again.');
    } finally {
      if (url) {
        const downloadUrl = url;
        window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      }
      setPending(false);
    }
  }
  if (locked) {
    return (
      <Button asChild type="button" variant="outline" size="sm">
        <Link href="/dashboard/plan">
          <Lock className="size-3.5" />
          Download CSV (Pro)
        </Link>
      </Button>
    );
  }
  return (
    <div>
      <Button type="button" variant="outline" size="sm" disabled={pending} onClick={download}>
        {pending ? 'Preparing…' : 'Download CSV'}
      </Button>
      {error && (
        <p role="alert" className="text-destructive mt-2 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
