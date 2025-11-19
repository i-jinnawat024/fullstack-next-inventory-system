/**
 * Error Handler Utility
 * Provides consistent error handling and user-friendly error messages
 * Requirements: 10.1-10.5
 */

import { THAI_LABELS } from '@/lib/constants/thai-labels';

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  field?: string;
}

/**
 * Parse API error response and return user-friendly message
 */
export function parseApiError(error: any): string {
  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return THAI_LABELS.networkError;
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle API error responses
  if (error?.error) {
    if (typeof error.error === 'string') {
      return error.error;
    }
    if (error.error.message) {
      return error.error.message;
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Default error message
  return THAI_LABELS.error;
}

/**
 * Get user-friendly error message based on HTTP status code
 */
export function getErrorMessageByStatus(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'ข้อมูลที่ส่งมาไม่ถูกต้อง';
    case 401:
      return THAI_LABELS.unauthorized;
    case 403:
      return THAI_LABELS.forbidden;
    case 404:
      return THAI_LABELS.notFound;
    case 409:
      return 'ข้อมูลซ้ำกับที่มีอยู่แล้ว';
    case 422:
      return 'ข้อมูลไม่ผ่านการตรวจสอบ';
    case 500:
      return THAI_LABELS.internalError;
    case 503:
      return 'ระบบไม่พร้อมให้บริการชั่วคราว';
    default:
      return THAI_LABELS.error;
  }
}

/**
 * Handle API response and throw error if not ok
 */
export async function handleApiResponse<T = any>(response: Response): Promise<T> {
  const result = await response.json();

  if (!response.ok) {
    const errorMessage = result.error?.message || 
                        result.message || 
                        getErrorMessageByStatus(response.status);
    
    const error: ApiError = {
      message: errorMessage,
      code: result.error?.code,
      statusCode: response.status,
      field: result.error?.field,
    };

    throw error;
  }

  return result.data || result;
}

/**
 * Validate form data and return validation errors
 */
export function getValidationErrors(errors: Record<string, any>): string[] {
  const messages: string[] = [];
  
  Object.entries(errors).forEach(([field, error]) => {
    if (error?.message) {
      messages.push(error.message);
    }
  });

  return messages;
}

/**
 * Format error for logging
 */
export function formatErrorForLogging(error: any): {
  message: string;
  stack?: string;
  code?: string;
  statusCode?: number;
  timestamp: string;
} {
  return {
    message: error?.message || String(error),
    stack: error?.stack,
    code: error?.code,
    statusCode: error?.statusCode,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  return (
    error instanceof TypeError &&
    (error.message.includes('fetch') || 
     error.message.includes('network') ||
     error.message.includes('Failed to fetch'))
  );
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: any): boolean {
  return (
    error?.statusCode === 401 ||
    error?.code === 'UNAUTHORIZED' ||
    error?.message?.includes('unauthorized') ||
    error?.message?.includes('authentication')
  );
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: any): boolean {
  return (
    error?.statusCode === 400 ||
    error?.statusCode === 422 ||
    error?.code === 'VALIDATION_ERROR'
  );
}
