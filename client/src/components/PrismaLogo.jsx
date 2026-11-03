import React from 'react';
import prismaLogoPng from '../assets/logo.png';

/**
 * PrismaLogo — Official Prisma Logo Component.
 * Displays the high-resolution logo image (shield with glowing prism).
 *
 * Props:
 * - size: number | string (height in px, default 38)
 * - alt: string (default "Prisma logo")
 * - className: optional CSS class
 * - style: optional inline style overrides
 */
export default function PrismaLogo({
  size = 38,
  alt = 'Prisma logo',
  className = '',
  style = {},
}) {
  const pixelHeight = typeof size === 'number' ? `${size}px` : size;

  return (
    <img
      src={prismaLogoPng}
      alt={alt}
      className={`prisma-brand-logo ${className}`.trim()}
      style={{
        height: pixelHeight,
        width: 'auto',
        maxWidth: 'none',
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        imageRendering: 'auto',
        ...style,
      }}
      loading="eager"
      decoding="async"
    />
  );
}
