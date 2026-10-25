/* eslint-disable no-restricted-syntax -- ImageResponse needs literal CSS colours */
import type { ReactElement } from 'react';

// ImageResponse needs literal colours: hex approximations of --primary and --primary-foreground.
export const BRAND_STEEL = '#1f6e78';
export const BRAND_PALE = '#eef3f2';

/** The stockkit "S" app mark for ImageResponse icons, using qkit's Georgia serif stand-in. */
export function brandIcon(size: number): ReactElement {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: BRAND_STEEL,
        color: BRAND_PALE,
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontWeight: 700,
        fontSize: size * 0.62,
        lineHeight: 1,
        borderRadius: size * 0.22,
      }}
    >
      S
    </div>
  );
}
