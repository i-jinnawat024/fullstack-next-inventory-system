import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/format';
import { THAI_LABELS } from '@/lib/constants/thai-labels';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast = ({ id, type, title, message, duration = 5000, onClose }: ToastProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match animation duration
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const styles = {
    success: {
      backgroundColor: 'var(--color-success-light)',
      borderColor: 'var(--color-success)',
      color: 'var(--color-success)',
    },
    error: {
      backgroundColor: 'var(--color-error-light)',
      borderColor: 'var(--color-error)',
      color: 'var(--color-error)',
    },
    warning: {
      backgroundColor: 'var(--color-warning-light)',
      borderColor: 'var(--color-warning)',
      color: 'var(--color-warning)',
    },
    info: {
      backgroundColor: 'var(--color-info-light)',
      borderColor: 'var(--color-info)',
      color: 'var(--color-info)',
    },
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg min-w-[320px] max-w-[420px]',
        'transition-all duration-300 ease-in-out',
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      )}
      style={{
        backgroundColor: styles[type].backgroundColor,
        borderColor: styles[type].borderColor,
      }}
    >
      <div className="flex-shrink-0 mt-0.5" style={{ color: styles[type].color }}>
        {icons[type]}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 
          className="font-semibold text-sm mb-1"
          style={{ color: 'var(--color-text)' }}
        >
          {title}
        </h4>
        {message && (
          <p 
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {message}
          </p>
        )}
      </div>

      <button
        onClick={handleClose}
        className="flex-shrink-0 rounded-md p-1 hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{ 
          color: 'var(--color-text-secondary)',
        }}
        aria-label={THAI_LABELS.close}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export { Toast };
