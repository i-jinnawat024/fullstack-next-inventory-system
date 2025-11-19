/**
 * Client-side authentication utilities
 * Provides helper functions for handling authentication in client components
 */

/**
 * Handle API response for authentication errors
 * Redirects to appropriate page based on status code
 * 
 * @param response - Fetch response object
 * @param router - Next.js router instance
 * @returns true if unauthorized/forbidden, false otherwise
 */
export function handleAuthError(
  response: Response,
  router: { push: (path: string) => void }
): boolean {
  if (response.status === 401) {
    // Unauthorized - redirect to login
    router.push('/login');
    return true;
  }

  if (response.status === 403) {
    // Forbidden - redirect to dashboard
    router.push('/dashboard');
    return true;
  }

  return false;
}

/**
 * Handle unauthorized access for admin routes
 * Redirects to home page
 * 
 * @param response - Fetch response object
 * @param router - Next.js router instance
 * @returns true if unauthorized/forbidden, false otherwise
 */
export function handleAdminAuthError(
  response: Response,
  router: { push: (path: string) => void }
): boolean {
  if (response.status === 401 || response.status === 403) {
    // Unauthorized or Forbidden - redirect to home
    router.push('/');
    return true;
  }

  return false;
}

/**
 * Extract error message from API response
 * 
 * @param result - API response JSON
 * @returns Error message string
 */
export function getErrorMessage(result: any): string {
  return result?.error?.message || 'เกิดข้อผิดพลาด';
}

/**
 * Check if response indicates authentication error
 * 
 * @param response - Fetch response object
 * @returns true if authentication error, false otherwise
 */
export function isAuthError(response: Response): boolean {
  return response.status === 401 || response.status === 403;
}

/**
 * Error messages for client-side display
 */
export const ClientAuthErrors = {
  UNAUTHORIZED: 'กรุณาเข้าสู่ระบบ',
  FORBIDDEN: 'คุณไม่มีสิทธิ์เข้าถึงฟีเจอร์นี้',
  SESSION_EXPIRED: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',
  NETWORK_ERROR: 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
} as const;
