/* eslint-disable no-restricted-syntax -- renders without the app stylesheet, so colours stay literal */
'use client';

import { BRAND_PALE, BRAND_STEEL } from '@/lib/brand-icon';

// Replaces the root layout when it throws, so it ships its own <html> and inline styles.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: BRAND_PALE,
          color: '#1c2333',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          padding: '1.5rem',
        }}
      >
        <div style={{ maxWidth: '24rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
            Something went wrong
          </h1>
          <p
            style={{ fontSize: '0.9rem', color: '#5c6478', margin: '0 0 1.5rem', lineHeight: 1.5 }}
          >
            An unexpected error interrupted the page. Please try again. If it keeps happening,
            refresh in a moment.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              cursor: 'pointer',
              border: 'none',
              borderRadius: '0.625rem',
              background: BRAND_STEEL,
              color: BRAND_PALE,
              fontSize: '0.9rem',
              fontWeight: 600,
              padding: '0.7rem 1.25rem',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
