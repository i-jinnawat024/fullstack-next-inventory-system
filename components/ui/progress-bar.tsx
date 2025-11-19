import { cn } from '@/lib/utils/format';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variantClasses = {
    default: 'bg-blue-600 dark:bg-blue-500',
    success: 'bg-green-600 dark:bg-green-500',
    warning: 'bg-yellow-600 dark:bg-yellow-500',
    error: 'bg-red-600 dark:bg-red-500',
  };

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showLabel && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 ease-in-out rounded-full',
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  size = 64,
  strokeWidth = 4,
  variant = 'default',
  showLabel = true,
  className,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const variantColors = {
    default: 'stroke-blue-600 dark:stroke-blue-500',
    success: 'stroke-green-600 dark:stroke-green-500',
    warning: 'stroke-yellow-600 dark:stroke-yellow-500',
    error: 'stroke-red-600 dark:stroke-red-500',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-gray-200 dark:stroke-gray-700"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={cn('transition-all duration-300 ease-in-out', variantColors[variant])}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-semibold text-gray-700 dark:text-gray-300">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
