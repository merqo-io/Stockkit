/* eslint-disable no-restricted-syntax -- ImageResponse needs literal CSS colours */
import { brandIcon } from '@merqo/ui';
import type { ReactElement } from 'react';

// ImageResponse needs literal colours: hex approximations of --primary and --primary-foreground.
export const BRAND_STEEL = '#1f6e78';
export const BRAND_PALE = '#eef3f2';

/** The stockkit "S" app mark for ImageResponse icons, using qkit's Georgia serif stand-in. */
export function stockkitIcon(size: number): ReactElement {
  return brandIcon(size, {
    monogram: 'S',
    background: BRAND_STEEL,
    foreground: BRAND_PALE,
    fontFamily: "Georgia, 'Times New Roman', serif",
    radius: size * 0.22,
  });
}
