import React, { useId } from 'react';

/**
 * PrismaLogo — Scalable vector logo for Prisma.
 * Updated to use the indigo/violet/teal palette that matches the new UI theme.
 */
export default function PrismaLogo({ size = 32, className = '', style = {} }) {
  const uid = useId().replace(/:/g, '');
  const idShieldBg    = `prisma-sbg-${uid}`;
  const idShieldStroke = `prisma-sst-${uid}`;
  const idGlass       = `prisma-gls-${uid}`;
  const idBeam        = `prisma-bm-${uid}`;
  const idCyan        = `prisma-cyn-${uid}`;
  const idBlue        = `prisma-blu-${uid}`;
  const idViolet      = `prisma-vio-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-label="Prisma Logo"
    >
      <defs>
        {/* Shield background — soft warm pearl tint */}
        <linearGradient id={idShieldBg} x1="24" y1="5" x2="24" y2="43" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#f0fdfa" />
          <stop offset="100%" stopColor="#fffbeb" />
        </linearGradient>
        {/* Shield stroke — emerald → amber → terracotta */}
        <linearGradient id={idShieldStroke} x1="7" y1="5" x2="41" y2="43" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#0f766e" />
          <stop offset="50%"  stopColor="#d97706" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
        {/* Prism glass fill */}
        <linearGradient id={idGlass} x1="14" y1="12" x2="34" y2="31" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#0f766e" stopOpacity="0.16" />
          <stop offset="50%"  stopColor="#d97706" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#7c2d12" stopOpacity="0.18" />
        </linearGradient>
        {/* Incoming beam */}
        <linearGradient id={idBeam} x1="6" y1="24.5" x2="18.5" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#0f766e" stopOpacity="0.15" />
          <stop offset="70%"  stopColor="#0f766e" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        {/* Top ray — amber */}
        <linearGradient id={idCyan} x1="27.5" y1="19" x2="41" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#0f766e" />
          <stop offset="50%"  stopColor="#d97706" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        {/* Middle ray — emerald teal */}
        <linearGradient id={idBlue} x1="29.5" y1="23" x2="41" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#0f766e" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        {/* Bottom ray — terracotta */}
        <linearGradient id={idViolet} x1="31.5" y1="27" x2="39" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#d97706" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
      </defs>

      {/* Protective Shield Silhouette */}
      <path
        d="M 24 5 L 41 12 C 41 26.5 32.5 37 24 43 C 15.5 37 7 26.5 7 12 Z"
        fill={`url(#${idShieldBg})`}
        stroke={`url(#${idShieldStroke})`}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Incident Light Beam */}
      <line
        x1="6.5" y1="24.5" x2="18.2" y2="23"
        stroke={`url(#${idBeam})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Internal Refraction Paths */}
      <path d="M 18.2 23 L 27.7 19" stroke="#0891b2" strokeWidth="1.2" strokeOpacity="0.5" />
      <path d="M 18.2 23 L 29.8 23" stroke="#4f46e5" strokeWidth="1.2" strokeOpacity="0.5" />
      <path d="M 18.2 23 L 31.9 27" stroke="#7c3aed" strokeWidth="1.2" strokeOpacity="0.5" />

      {/* Dispersed Spectrum Rays */}
      <line x1="27.7" y1="19" x2="41" y2="16" stroke={`url(#${idCyan})`}   strokeWidth="2.2" strokeLinecap="round" />
      <line x1="29.8" y1="23" x2="41" y2="23" stroke={`url(#${idBlue})`}   strokeWidth="2.2" strokeLinecap="round" />
      <line x1="31.9" y1="27" x2="39" y2="30" stroke={`url(#${idViolet})`} strokeWidth="2.2" strokeLinecap="round" />

      {/* Triangular Geometric Prism Body */}
      <polygon
        points="24,12 34,31 14,31"
        fill={`url(#${idGlass})`}
        stroke="#0891b2"
        strokeWidth="1.6"
        strokeOpacity="0.65"
        strokeLinejoin="round"
      />

      {/* Precision Focal Nodes */}
      <circle cx="24"   cy="12" r="1.4" fill="#4f46e5" />
      <circle cx="18.2" cy="23" r="1.2" fill="#4f46e5" />
    </svg>
  );
}
