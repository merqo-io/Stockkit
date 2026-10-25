import { Footer } from '@merqo/ui';

interface SiteFooterProps {
  tagline?: string;
  creditText?: string;
  /** Only meaningful on the signed-out public page — the dashboard's own
   * footer usage (already inside an authenticated area) omits this. */
  showSignIn?: boolean;
}

/**
 * Thin adapter over `@merqo/ui`'s shared `Footer`, supplying stockkit's own
 * wordmark and copy. The shared component gained `showSignIn`/`copyright` in
 * v0.31.0 specifically so this kit could stop carrying its own copy of the
 * layout, which had drifted out of a shared component without ever differing
 * from one.
 */
export function SiteFooter({
  tagline = 'Inventory tracking for small vendors.',
  creditText = '© 2026 stockkit · a Merqo kit',
  showSignIn = false,
}: SiteFooterProps) {
  return (
    <Footer
      kitName="stockkit"
      tagline={tagline}
      copyright={creditText}
      showSignIn={showSignIn}
      wordmark={
        // eslint-disable-next-line @next/next/no-html-link-for-pages -- Link leaves the old hash in the URL bar on a fragment-only jump
        <a
          href="/#top"
          aria-label="stockkit home, back to top"
          className="font-display text-foreground text-lg font-bold tracking-tight transition-opacity hover:opacity-80"
        >
          StockKit
        </a>
      }
    />
  );
}
