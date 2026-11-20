// @vitest-environment jsdom
import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import Link from 'next/link';
import { describe, expect, it, vi } from 'vitest';

const { providerProps } = vi.hoisted(() => ({ providerProps: vi.fn() }));
vi.mock('@merqo/ui', () => ({
  AppLinkProvider: (props: { component: unknown; children: ReactNode }) => {
    providerProps(props);
    return <div data-testid="provider">{props.children}</div>;
  },
}));

import { AppLinks } from './app-link-provider';

describe('AppLinks', () => {
  it('mounts AppLinkProvider with next/link and renders its children', () => {
    render(
      <AppLinks>
        <span>child</span>
      </AppLinks>
    );
    expect(providerProps.mock.calls[0][0].component).toBe(Link);
    expect(screen.getByTestId('provider')).toHaveTextContent('child');
  });
});
