import { stockkitIcon } from '@/lib/brand';
import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(stockkitIcon(180), { ...size });
}
