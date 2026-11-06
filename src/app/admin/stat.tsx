import { cn } from '@/lib/utils';
import { StatTile } from '@merqo/ui';

/** A back-office figure tile: wraps @merqo/ui's shared StatTile in a flat bordered tile. */
export function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className={cn('border-border bg-card rounded-xl border p-4', className)}>
      <StatTile label={label} value={String(value)} valueClassName="font-mono" />
    </div>
  );
}
