/* eslint-disable no-restricted-syntax -- renders without the app stylesheet, so colours stay literal */
'use client';

import { BRAND_PALE, BRAND_STEEL } from '@/lib/brand';
import { GlobalError } from '@merqo/ui';

// Replaces the root layout when it throws, so the shared body ships its own <html> and inline styles.
export default function RootGlobalError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <GlobalError
      reset={props.reset}
      colors={{
        background: BRAND_PALE,
        foreground: '#1c2333',
        mutedForeground: '#5c6478',
        primary: BRAND_STEEL,
        primaryForeground: BRAND_PALE,
      }}
      fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
      radius="0.625rem"
      description="An unexpected error interrupted the page. Please try again. If it keeps happening, refresh in a moment."
    />
  );
}
