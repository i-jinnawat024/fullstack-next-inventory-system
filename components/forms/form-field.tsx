import { ReactNode } from 'react';
import { cn } from '@/lib/utils/format';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
  htmlFor?: string;
}

export function FormField({
  label,
  required = false,
  error,
  helpText,
  disabled = false,
  loading = false,
  children,
  htmlFor,
}: FormFieldProps) {
  return (
    <div className={cn('form-field', disabled && 'opacity-60')}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium mb-1.5"
        style={{ color: 'var(--color-text)' }}
      >
        {label}
        {required && (
          <span
            className="ml-1"
            style={{ color: 'var(--color-error)' }}
            aria-label="required"
          >
            *
          </span>
        )}
      </label>

      <div className={cn('relative', loading && 'opacity-50 pointer-events-none')}>
        {children}
      </div>

      {helpText && !error && (
        <p
          className="mt-1.5 text-xs"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {helpText}
        </p>
      )}

      {error && (
        <div className="flex items-start gap-1.5 mt-1.5">
          <svg
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            style={{ color: 'var(--color-error)' }}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
          <p
            className="text-xs"
            style={{ color: 'var(--color-error)' }}
            role="alert"
          >
            {error}
          </p>
        </div>
      )}
    </div>
  );
}

export type { FormFieldProps };
