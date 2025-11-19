'use client';

import { ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/format';
import { Button } from './button';

interface ErrorStateProps {
  title?: string;
  message: string;
  icon?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  variant?: 'inline' | 'card' | 'page';
}

/**
 * Error state component for displaying errors with retry functionality
 * Supports different variants for different contexts
 */
export function ErrorState({
  title = 'เกิดข้อผิดพลาด',
  message,
  icon,
  onRetry,
  retryLabel = 'ลองอีกครั้ง',
  className,
  variant = 'inline',
}: ErrorStateProps) {
  const defaultIcon = <AlertTriangle className="w-6 h-6" aria-hidden="true" />;

  if (variant === 'inline') {
    return (
      <div
        className={cn('flex items-start gap-3 p-4 rounded-lg', className)}
        style={{
          backgroundColor: 'var(--color-error)',
          opacity: 0.1,
        }}
        role="alert"
      >
        <div
          className="flex-shrink-0 mt-0.5"
          style={{ color: 'var(--color-error)' }}
        >
          {icon || defaultIcon}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--color-error)' }}
          >
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium underline hover:no-underline transition-all"
              style={{ color: 'var(--color-error)' }}
            >
              {retryLabel}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={cn('rounded-lg p-6 text-center', className)}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--color-border)',
        }}
        role="alert"
      >
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
          style={{
            backgroundColor: 'var(--color-error)',
            opacity: 0.1,
          }}
        >
          <div style={{ color: 'var(--color-error)' }}>
            {icon || defaultIcon}
          </div>
        </div>
        {title && (
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            {title}
          </h3>
        )}
        <p
          className="text-sm mb-4"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {message}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="secondary" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
            {retryLabel}
          </Button>
        )}
      </div>
    );
  }

  // Page variant
  return (
    <div
      className={cn(
        'min-h-[400px] flex items-center justify-center px-4',
        className
      )}
      role="alert"
    >
      <div className="max-w-md w-full text-center">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
          style={{
            backgroundColor: 'var(--color-error)',
            opacity: 0.1,
          }}
        >
          <div style={{ color: 'var(--color-error)' }}>
            {icon || <AlertTriangle className="w-8 h-8" aria-hidden="true" />}
          </div>
        </div>
        {title && (
          <h2
            className="text-2xl font-semibold mb-3"
            style={{ color: 'var(--color-text)' }}
          >
            {title}
          </h2>
        )}
        <p
          className="text-base mb-6"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {message}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="primary">
            <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
