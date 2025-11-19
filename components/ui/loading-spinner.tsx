import { cn } from '@/lib/utils/format';
import { THAI_LABELS } from '@/lib/constants/thai-labels';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={cn(
        'rounded-full animate-spin',
        'border-gray-200 dark:border-gray-700',
        'border-t-blue-600 dark:border-t-blue-400',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label={THAI_LABELS.loading}
    >
      <span className="sr-only">{THAI_LABELS.loading}</span>
    </div>
  );
}

export function LoadingSpinner({ 
  size = 'md', 
  text 
}: { 
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Spinner size={size} />
      {text && (
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {text}
        </p>
      )}
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">{THAI_LABELS.loading}</p>
      </div>
    </div>
  );
}

export function OverlayLoader({ message }: { message?: string }) {
  return (
    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="text-center">
        <Spinner size="lg" />
        {message && (
          <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
        )}
      </div>
    </div>
  );
}
