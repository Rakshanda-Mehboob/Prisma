import React, { useId } from 'react';

/**
 * PrismaLogo — Scalable vector logo for Prisma.
 * Visually combines a precision geometric triangular prism,
 * internal light refraction splitting into a vibrant cyber spectrum
 * (Cyan, Electric Blue, Violet), and a protective cyber shield contour.
 */
export default function PrismaLogo({ size = 32, className = '', style = {} }) {
  const uid = useId().replace(/:/g, '');
  const idShieldBg = `prisma-sbg-${uid}`;
  const idShieldStroke = `prisma-sst-${uid}`;
  const idGlass = `prisma-gls-${uid}`;
  const idBeam = `prisma-bm-${uid}`;
  const idCyan = `prisma-cyn-${uid}`;
  const idBlue = `prisma-blu-${uid}`;
  const idViolet = `prisma-vio-${uid}`;

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
        <linearGradient id={idShieldBg} x1="24" y1="5" x2="24" y2="43" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#0e1530" />
          <stop offset="100%" stop-color="#050816" />
        </linearGradient>
        <linearGradient id={idShieldStroke} x1="7" y1="5" x2="41" y2="43" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#7c3aed" />
          <stop offset="50%" stop-color="#00f5ff" />
          <stop offset="100%" stop-color="#2563eb" />
        </linearGradient>
        <linearGradient id={idGlass} x1="14" y1="12" x2="34" y2="31" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#00f5ff" stop-opacity="0.22" />
          <stop offset="50%" stop-color="#6366f1" stop-opacity="0.12" />
          <stop offset="100%" stop-color="#a855f7" stop-opacity="0.28" />
        </linearGradient>
        <linearGradient id={idBeam} x1="6" y1="24.5" x2="18.5" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.15" />
          <stop offset="70%" stop-color="#ffffff" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#00f5ff" />
        </linearGradient>
        <linearGradient id={idCyan} x1="27.5" y1="19" x2="41" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="35%" stop-color="#00f5ff" />
          <stop offset="100%" stop-color="#38bdf8" />
        </linearGradient>
        <linearGradient id={idBlue} x1="29.5" y1="23" x2="41" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="100%" stop-color="#2563eb" />
        </linearGradient>
        <linearGradient id={idViolet} x1="31.5" y1="27" x2="39" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#c084fc" />
          <stop offset="100%" stop-color="#7c3aed" />
        </linearGradient>
      </defs>

      {/* Protective Cyber Shield Silhouette */}
      <path
        d="M 24 5 L 41 12 C 41 26.5 32.5 37 24 43 C 15.5 37 7 26.5 7 12 Z"
        fill={`url(#${idShieldBg})`}
        stroke={`url(#${idShieldStroke})`}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Incident Light Beam */}
      <line
        x1="6.5"
        y1="24.5"
        x2="18.2"
        y2="23"
        stroke={`url(#${idBeam})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Internal Refraction Paths */}
      <path
        d="M 18.2 23 L 27.7 19"
        stroke="#00f5ff"
        strokeWidth="1.2"
        strokeOpacity="0.65"
      />
      <path
        d="M 18.2 23 L 29.8 23"
        stroke="#38bdf8"
        strokeWidth="1.2"
        strokeOpacity="0.65"
      />
      <path
        d="M 18.2 23 L 31.9 27"
        stroke="#a78bfa"
        strokeWidth="1.2"
        strokeOpacity="0.65"
      />

      {/* Dispersed Spectrum Rays (Refraction) */}
      <line
        x1="27.7"
        y1="19"
        x2="41"
        y2="16"
        stroke={`url(#${idCyan})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="29.8"
        y1="23"
        x2="41"
        y2="23"
        stroke={`url(#${idBlue})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="31.9"
        y1="27"
        x2="39"
        y2="30"
        stroke={`url(#${idViolet})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Triangular Geometric Prism Body */}
      <polygon
        points="24,12 34,31 14,31"
        fill={`url(#${idGlass})`}
        stroke="#00f5ff"
        strokeWidth="1.6"
        strokeOpacity="0.85"
        strokeLinejoin="round"
      />

      {/* Precision Focal Nodes */}
      <circle cx="24" cy="12" r="1.4" fill="#ffffff" />
      <circle cx="18.2" cy="23" r="1.2" fill="#ffffff" />
    </svg>
  );
}
