/**
 * Error logging utility for centralized error handling and logging
 * Can be extended to integrate with error tracking services like Sentry, LogRocket, etc.
 */

export interface ErrorLogData {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  context?: Record<string, any>;
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: ErrorLogData[] = [];

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log an error with context
   */
  logError(error: Error, context?: Record<string, any>): void {
    const errorData: ErrorLogData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      context,
    };

    // Store in memory (for development)
    this.logs.push(errorData);

    // Log to console
    console.error('Error logged:', errorData);

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(errorData);
    }
  }

  /**
   * Log a React component error
   */
  logComponentError(error: Error, errorInfo: React.ErrorInfo, context?: Record<string, any>): void {
    const errorData: ErrorLogData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack || undefined,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      context,
    };

    // Store in memory (for development)
    this.logs.push(errorData);

    // Log to console
    console.error('Component error logged:', errorData);

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(errorData);
    }
  }

  /**
   * Log an API error
   */
  logApiError(
    endpoint: string,
    method: string,
    status: number,
    message: string,
    context?: Record<string, any>
  ): void {
    const errorData: ErrorLogData = {
      message: `API Error: ${method} ${endpoint} - ${status} ${message}`,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      context: {
        ...context,
        endpoint,
        method,
        status,
      },
    };

    // Store in memory (for development)
    this.logs.push(errorData);

    // Log to console
    console.error('API error logged:', errorData);

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(errorData);
    }
  }

  /**
   * Get all logged errors (for debugging)
   */
  getLogs(): ErrorLogData[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Send error to external error tracking service
   * TODO: Integrate with Sentry, LogRocket, or other service
   */
  private sendToErrorService(errorData: ErrorLogData): void {
    // Example: Send to Sentry
    // Sentry.captureException(new Error(errorData.message), {
    //   contexts: {
    //     error: errorData,
    //   },
    // });

    // Example: Send to custom API endpoint
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData),
    // }).catch(console.error);

    // For now, just log to console
    console.log('Would send to error service:', errorData);
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();

/**
 * Helper function to log errors
 */
export function logError(error: Error, context?: Record<string, any>): void {
  errorLogger.logError(error, context);
}

/**
 * Helper function to log component errors
 */
export function logComponentError(
  error: Error,
  errorInfo: React.ErrorInfo,
  context?: Record<string, any>
): void {
  errorLogger.logComponentError(error, errorInfo, context);
}

/**
 * Helper function to log API errors
 */
export function logApiError(
  endpoint: string,
  method: string,
  status: number,
  message: string,
  context?: Record<string, any>
): void {
  errorLogger.logApiError(endpoint, method, status, message, context);
}
