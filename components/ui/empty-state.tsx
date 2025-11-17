'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/format';
import { Button } from './button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Empty state component for displaying when there's no data
 * Used in tables, lists, and other data display components
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {icon && (
        <div
          className="mb-4 rounded-full p-3"
          style={{
            backgroundColor: 'var(--color-surface-hover)',
            color: 'var(--color-text-muted)',
          }}
        >
          {icon}
        </div>
      )}
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: 'var(--color-text)' }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-sm mb-6 max-w-md"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}
    </div>
  );
}
