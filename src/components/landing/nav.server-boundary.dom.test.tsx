// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { accountNavProps } = vi.hoisted(() => ({ accountNavProps: vi.fn() }));
vi.mock('@merqo/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@merqo/ui')>()),
  LandingAccountNav: (props: Record<string, unknown>) => {
    accountNavProps(props);
    return null;
  },
}));
vi.mock('@/app/actions/auth', () => ({ signOutAction: vi.fn() }));
vi.mock('@/app/actions/feedback', () => ({ submitFeedbackAction: vi.fn() }));
vi.mock('@/app/actions/support', () => ({ submitLandingSupportAction: vi.fn() }));

import { Nav } from './nav';

describe('Nav server/client boundary', () => {
  // next/link in a Server Component is a plain function, which React cannot
  // serialize into a client component's props.
  it('does not pass a LinkComponent to the client LandingAccountNav', () => {
    render(<Nav user={{ name: 'Ada Stall', email: 'ada@b.co' }} />);
    expect(accountNavProps).toHaveBeenCalled();
    expect(accountNavProps.mock.calls[0][0].LinkComponent).toBeUndefined();
  });
});
