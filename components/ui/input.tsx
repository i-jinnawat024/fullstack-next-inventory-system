import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/format';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full px-3 py-2 rounded-md border transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'focus:ring-primary',
            className
          )}
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: error ? 'var(--color-error)' : 'var(--color-border)',
            color: 'var(--color-text)',
          }}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm" style={{ color: 'var(--color-error)' }}>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };