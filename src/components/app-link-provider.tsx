'use client';

import type { ReactNode } from 'react';

import { AppLinkProvider } from '@merqo/ui';
import Link from 'next/link';

// next/link is a function, which a Server Component cannot pass to a client
// export as a prop. Mounting it here, inside a client boundary, gives every
// `@merqo/ui` client export client-side navigation without a LinkComponent prop.
export function AppLinks({ children }: Readonly<{ children: ReactNode }>) {
  return <AppLinkProvider component={Link}>{children}</AppLinkProvider>;
}
