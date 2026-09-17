import React from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon = <ShieldAlert size={32} color="var(--color-primary-light)" />,
  title = 'No Data Found',
  description = 'There are currently no records or activities to display.',
  actionLabel = null,
  onAction = null,
  actionIcon = <ArrowRight size={15} />,
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-desc">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} iconRight={actionIcon}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
