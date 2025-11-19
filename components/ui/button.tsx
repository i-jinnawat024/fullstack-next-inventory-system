import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils/format';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
  'aria-label'?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    disabled, 
    icon,
    iconPosition = 'left',
    fullWidth = false,
    children, 
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'text-white shadow-sm hover:opacity-90 focus:ring-primary',
      secondary: 'border shadow-sm hover:opacity-90 focus:ring-primary',
      tertiary: 'hover:opacity-80 focus:ring-primary',
      danger: 'text-white shadow-sm hover:opacity-90 focus:ring-red-500',
    };

    const sizes = {
      sm: 'h-10 md:h-8 px-3 text-sm gap-1.5', // Min 44px on mobile
      md: 'h-11 md:h-10 px-4 text-sm gap-2', // Min 44px on mobile
      lg: 'h-12 px-6 text-base gap-2',
    };

    const variantStyles = {
      primary: {
        backgroundColor: 'var(--color-primary)',
      },
      secondary: {
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text)',
        borderColor: 'var(--color-border)',
      },
      tertiary: {
        backgroundColor: 'transparent',
        color: 'var(--color-text)',
      },
      danger: {
        backgroundColor: 'var(--color-error)',
      },
    };

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };

    const renderIcon = (iconElement: ReactNode) => {
      if (!iconElement) return null;
      return <span className={iconSizes[size]}>{iconElement}</span>;
    };

    const renderContent = () => {
      if (loading) {
        return (
          <>
            <svg
              className={cn('animate-spin', iconSizes[size])}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
            <span>{children}</span>
          </>
        );
      }

      if (icon && iconPosition === 'left') {
        return (
          <>
            {renderIcon(icon)}
            <span>{children}</span>
          </>
        );
      }

      if (icon && iconPosition === 'right') {
        return (
          <>
            <span>{children}</span>
            {renderIcon(icon)}
          </>
        );
      }

      return <span>{children}</span>;
    };

    return (
      <button
        className={cn(
          baseStyles, 
          variants[variant], 
          sizes[size], 
          fullWidth && 'w-full',
          className
        )}
        style={variantStyles[variant]}
        disabled={disabled || loading}
        ref={ref}
        aria-busy={loading}
        {...props}
      >
        {renderContent()}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };