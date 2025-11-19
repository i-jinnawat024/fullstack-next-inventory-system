import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/format';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  error?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, error, fullWidth = true, disabled, placeholder, ...props }, ref) => {
    const baseStyles = 'rounded-md px-3 py-2 pr-10 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none bg-no-repeat bg-right';
    
    // SVG chevron icon as background
    const chevronIcon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E`;

    return (
      <select
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
          backgroundImage: `url("${chevronIcon}")`,
          backgroundPosition: 'right 0.5rem center',
          backgroundSize: '1.5rem 1.5rem',
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
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select';

export { Select };
export type { SelectProps, SelectOption };
