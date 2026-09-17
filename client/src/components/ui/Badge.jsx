import React from 'react';

export default function Badge({
  children,
  variant = 'primary', // primary | cyan | success | warning | danger | muted
  icon = null,
  className = '',
  style = {},
}) {
  const variantClass = {
    primary: 'badge-primary',
    cyan: 'badge-cyan',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    muted: 'badge-muted',
  }[variant] || 'badge-primary';

  return (
    <span className={`badge ${variantClass} ${className}`} style={style}>
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  );
}
