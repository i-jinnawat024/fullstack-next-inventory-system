'use client';

import { Component, ReactNode } from 'react';
import { ErrorState } from './error-state';
import { logComponentError } from '@/lib/utils/error-logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Section-level error boundary for catching errors in specific sections
 * Displays inline error state instead of full-page error
 */
export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error with section context
    logComponentError(error, errorInfo, {
      section: this.props.sectionName || 'unknown',
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default inline error state
      return (
        <ErrorState
          variant="card"
          message={
            this.state.error?.message ||
            'เกิดข้อผิดพลาดในการแสดงส่วนนี้ กรุณาลองใหม่อีกครั้ง'
          }
          onRetry={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
