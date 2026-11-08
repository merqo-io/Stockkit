import { cn } from '@merqo/ui/primitives';

interface BrandTextProps {
  className?: string;
}

// Logo mark only — PascalCase compound per the locked kit-brand naming
// convention (docs/business/2026-07-15-kit-brand-naming-convention.md).
// Every other surface (titles, prose, docs, slugs) stays lowercase "stockkit".
export function BrandText({ className }: BrandTextProps) {
  return (
    <>
      <span className="text-brand-gradient">Stock</span>
      <span className={cn('text-foreground', className)}>Kit</span>
    </>
  );
}
