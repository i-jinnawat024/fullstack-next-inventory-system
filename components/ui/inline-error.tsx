'use client';

import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/format';

interface InlineErrorProps {
  message: string;
  className?: string;
}

/**
 * Inline error component for displaying error messages below form fields
 * Used for validation errors and field-specific error messages
 */
export function InlineError({ message, className }: InlineErrorProps) {
  if (!message) return null;

  return (
    <div
      className={cn('flex items-start gap-1.5 mt-1.5 text-sm', className)}
      style={{ color: 'var(--color-error)' }}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
