'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Enhanced Error Boundary component with logging and user-friendly fallback UI
 * Catches React component errors and displays a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({ errorInfo });
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state if resetKeys change
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      prevProps.resetKeys &&
      this.props.resetKeys.some((key, index) => key !== prevProps.resetKeys?.[index])
    ) {
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    }
  }

  logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // In production, send error to logging service
    // Example: Sentry, LogRocket, etc.
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    // Log to console in production for now
    console.error('Error logged:', errorData);
    
    // TODO: Send to error tracking service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          className="min-h-screen flex items-center justify-center px-4"
          style={{ backgroundColor: 'var(--color-background)' }}
        >
          <div
            className="max-w-md w-full rounded-lg p-8"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div
              className="flex items-center justify-center w-16 h-16 mx-auto rounded-full mb-6"
              style={{
                backgroundColor: 'var(--color-error)',
                opacity: 0.1,
              }}
            >
              <AlertTriangle
                className="w-8 h-8"
                style={{ color: 'var(--color-error)' }}
                aria-hidden="true"
              />
            </div>
            <h2
              className="text-2xl font-semibold text-center mb-3"
              style={{ color: 'var(--color-text)' }}
            >
              เกิดข้อผิดพลาด
            </h2>
            <p
              className="text-center text-base mb-6"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              ขออภัย เกิดข้อผิดพลาดในการแสดงผล กรุณาลองใหม่อีกครั้ง
            </p>
            
            {/* Show error details in development */}
            {this.state.error && process.env.NODE_ENV === 'development' && (
              <div
                className="mt-4 p-4 rounded-lg text-xs overflow-auto max-h-48"
                style={{
                  backgroundColor: 'var(--color-surface-hover)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <div className="font-semibold mb-2">Error Details:</div>
                <pre className="whitespace-pre-wrap break-words mb-3">
                  {this.state.error.message}
                </pre>
                {this.state.error.stack && (
                  <>
                    <div className="font-semibold mb-2">Stack Trace:</div>
                    <pre className="whitespace-pre-wrap break-words text-xs opacity-70">
                      {this.state.error.stack}
                    </pre>
                  </>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 mt-6">
              <Button onClick={this.handleReset} variant="primary" fullWidth>
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                ลองอีกครั้ง
              </Button>
              <Button onClick={this.handleReload} variant="secondary" fullWidth>
                โหลดหน้าใหม่
              </Button>
              <Button onClick={this.handleGoHome} variant="tertiary" fullWidth>
                <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                กลับหน้าหลัก
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
