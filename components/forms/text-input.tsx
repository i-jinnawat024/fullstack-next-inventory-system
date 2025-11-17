import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/format';

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: boolean;
  fullWidth?: boolean;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, error, fullWidth = true, disabled, ...props }, ref) => {
    const baseStyles = 'rounded-md px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0';
    
    return (
      <input
        ref={ref}
        className={cn(
          baseStyles,
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

TextInput.displayName = 'TextInput';

export { TextInput };
export type { TextInputProps };
