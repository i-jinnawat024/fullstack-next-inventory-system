'use client';

import { useEffect } from 'react';
import { Button } from './button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

/**
 * ConfirmationDialog Component
 * Reusable confirmation dialog for destructive or important actions
 * Requirements: 3.1-3.6, 10.1-10.5
 */
export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'danger',
}: ConfirmationDialogProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  // Get variant colors
  const getVariantColors = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: '#fee2e2',
          iconColor: '#dc2626',
          confirmBg: '#dc2626',
          confirmHover: '#b91c1c',
        };
      case 'warning':
        return {
          iconBg: '#fef3c7',
          iconColor: '#f59e0b',
          confirmBg: '#f59e0b',
          confirmHover: '#d97706',
        };
      case 'info':
        return {
          iconBg: 'var(--color-primary)' + '20',
          iconColor: 'var(--color-primary)',
          confirmBg: 'var(--color-primary)',
          confirmHover: 'var(--color-primary)',
        };
    }
  };

  const colors = getVariantColors();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onCancel();
        }
      }}
    >
      <div
        className="relative w-full max-w-md mx-4 rounded-lg shadow-xl"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        {/* Dialog Content */}
        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center mb-4">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-full"
              style={{
                backgroundColor: colors.iconBg,
              }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke={colors.iconColor}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h3
            id="dialog-title"
            className="text-lg font-semibold text-center mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            {title}
          </h3>

          {/* Message */}
          <p
            id="dialog-description"
            className="text-sm text-center mb-6"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              {cancelText}
            </Button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: colors.confirmBg,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = colors.confirmHover;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.confirmBg;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isLoading ? 'กำลังดำเนินการ...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
