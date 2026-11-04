import { cn, EYEBROW_CLASS } from '@/lib/utils';
import type { ReactNode } from 'react';

/**
 * The top of a dashboard page: a small-caps label saying which area this is,
 * the page's title in the display font, and optionally a sentence under it
 * (passed as children).
 *
 * Renders only those elements, with no wrapper, so each page keeps its own
 * surrounding layout (a back link above, an action beside) and the component
 * stays a drop-in for a future shared `@merqo/ui` export.
 */
export function PageHeader({
  eyebrow,
  title,
  responsive = false,
  children,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  // One size down on a phone, for a page whose title shares its row with a
  // button.
  responsive?: boolean;
  children?: ReactNode;
}) {
  return (
    <>
      <p className={EYEBROW_CLASS}>{eyebrow}</p>
      <h1
        className={cn(
          'font-display leading-none font-semibold',
          responsive ? 'text-3xl sm:text-4xl' : 'text-4xl'
        )}
      >
        {title}
      </h1>
      {children && <p className="text-muted-foreground mt-2 text-sm">{children}</p>}
    </>
  );
}
