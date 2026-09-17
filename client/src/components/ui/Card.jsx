import React from 'react';

export default function Card({
  children,
  className = '',
  title = null,
  subtitle = null,
  icon = null,
  headerAction = null,
  glow = null, // 'primary' | 'cyan' | null
  hover = false,
  style = {},
  ...props
}) {
  const glowClass = glow === 'primary' ? 'card-glow-primary' : glow === 'cyan' ? 'card-glow-cyan' : '';
  const hoverClass = hover ? 'card-hover' : '';

  return (
    <div className={`card ${glowClass} ${hoverClass} ${className}`} style={style} {...props}>
      {(title || headerAction) && (
        <div className="card-header">
          <div>
            <h3 className="card-title">
              {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
              {title}
            </h3>
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
