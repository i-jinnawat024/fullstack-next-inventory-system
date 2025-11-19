import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/format';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, fullWidth = true, resize = 'vertical', disabled, rows = 4, ...props }, ref) => {
    const baseStyles = 'rounded-md px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0';
    
    const resizeStyles = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          baseStyles,
          resizeStyles[resize],
          fullWidth && 'w-full',
          error && 'ring-2',
          disabled && 'cursor-not-allowed opacity-60',
          className
        )}
        style={{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: error ? 'var(--color-error)' : 'var(--color-border)',
          ...(error && {
            '--tw-ring-color': 'var(--color-error)',
          } as any),
          ...(!error && {
            '--tw-ring-color': 'var(--color-primary)',
          } as any),
        }}
        disabled={disabled}
        aria-invalid={error}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
export type { TextareaProps };
