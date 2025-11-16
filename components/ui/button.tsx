import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/format';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'text-white shadow-sm hover:opacity-90 focus:ring-primary',
      secondary: 'text-white shadow-sm hover:opacity-90 focus:ring-primary',
      outline: 'border shadow-sm hover:opacity-90 focus:ring-primary',
      ghost: 'hover:opacity-80 focus:ring-primary',
      danger: 'text-white shadow-sm hover:opacity-90 focus:ring-red-500',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    const variantStyles = {
      primary: {
        backgroundColor: 'var(--color-primary)',
      },
      secondary: {
        backgroundColor: 'var(--color-bg-secondary)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
      },
      outline: {
        backgroundColor: 'transparent',
        color: 'var(--color-text)',
        borderColor: 'var(--color-border)',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--color-text)',
      },
      danger: {
        backgroundColor: 'var(--color-error)',
      },
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        style={variantStyles[variant]}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };