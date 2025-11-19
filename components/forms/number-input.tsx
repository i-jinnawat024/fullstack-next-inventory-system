import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/format';

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  error?: boolean;
  fullWidth?: boolean;
  showButtons?: boolean;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ 
    className, 
    error, 
    fullWidth = true, 
    disabled, 
    showButtons = true,
    onIncrement,
    onDecrement,
    min,
    max,
    step = 1,
    value,
    onChange,
    ...props 
  }, ref) => {
    const baseStyles = 'rounded-md px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0';
    
    const handleIncrement = () => {
      if (disabled) return;
      
      if (onIncrement) {
        onIncrement();
      } else if (onChange) {
        const currentValue = typeof value === 'number' ? value : parseFloat(value as string) || 0;
        const stepValue = typeof step === 'number' ? step : parseFloat(step as string) || 1;
        const newValue = currentValue + stepValue;
        const maxValue = typeof max === 'number' ? max : parseFloat(max as string);
        
        if (max !== undefined && !isNaN(maxValue) && newValue > maxValue) return;
        
        const event = {
          target: { value: newValue.toString() },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    };

    const handleDecrement = () => {
      if (disabled) return;
      
      if (onDecrement) {
        onDecrement();
      } else if (onChange) {
        const currentValue = typeof value === 'number' ? value : parseFloat(value as string) || 0;
        const stepValue = typeof step === 'number' ? step : parseFloat(step as string) || 1;
        const newValue = currentValue - stepValue;
        const minValue = typeof min === 'number' ? min : parseFloat(min as string);
        
        if (min !== undefined && !isNaN(minValue) && newValue < minValue) return;
        
        const event = {
          target: { value: newValue.toString() },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    };

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        <input
          ref={ref}
          type="number"
          className={cn(
            baseStyles,
            fullWidth && 'w-full',
            showButtons && 'pr-16',
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
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          {...props}
        />
        
        {showButtons && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={disabled || (min !== undefined && typeof value === 'number' && typeof min === 'number' && value <= min)}
              className={cn(
                'w-7 h-7 rounded flex items-center justify-center transition-all',
                'hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed'
              )}
              style={{
                backgroundColor: 'var(--color-surface-hover)',
                color: 'var(--color-text)',
              }}
              aria-label="Decrement"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={disabled || (max !== undefined && typeof value === 'number' && typeof max === 'number' && value >= max)}
              className={cn(
                'w-7 h-7 rounded flex items-center justify-center transition-all',
                'hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed'
              )}
              style={{
                backgroundColor: 'var(--color-surface-hover)',
                color: 'var(--color-text)',
              }}
              aria-label="Increment"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';

export { NumberInput };
export type { NumberInputProps };
