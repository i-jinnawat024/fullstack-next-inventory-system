'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastType, ToastProps } from '@/components/ui/toast';

interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, duration?: number) => void;
  showWarning: (title: string, message?: string, duration?: number) => void;
  showInfo: (title: string, message?: string, duration?: number) => void;
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const generateId = () => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const showToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration: number = 5000
  ) => {
    const id = generateId();
    const newToast: ToastData = {
      id,
      type,
      title,
      message,
      duration,
    };

    setToasts((prev) => [...prev, newToast]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    showToast('success', title, message, duration);
  }, [showToast]);

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    showToast('error', title, message, duration);
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    showToast('warning', title, message, duration);
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    showToast('info', title, message, duration);
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showToast,
        removeToast,
      }}
    >
      {children}
      
      {/* Toast Container - ARIA live region for accessibility (Requirement: 10.5) */}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
        role="region"
        aria-label="การแจ้งเตือน"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              id={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              duration={toast.duration}
              onClose={removeToast}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
