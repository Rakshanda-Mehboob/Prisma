import React from 'react';

export default function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-sm)',
  className = '',
  style = {},
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <Skeleton height="1.5rem" width="60%" />
      <Skeleton height="0.85rem" width="90%" />
      <Skeleton height="0.85rem" width="75%" />
      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
        <Skeleton height="2rem" width="80px" borderRadius="var(--radius-md)" />
        <Skeleton height="2rem" width="100px" borderRadius="var(--radius-md)" />
      </div>
    </div>
  );
}
