import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromCookie } from '@/lib/auth/jwt';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = extractTokenFromCookie(request.headers.get('cookie'));
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/forgot-password', '/api/auth/login', '/api/auth/forgot'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Check if user is authenticated
  if (!token) {
    // Redirect to login for protected routes
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Verify token
  const payload = verifyToken(token);
  if (!payload) {
    // Invalid token - redirect to login
    const response = pathname.startsWith('/api/')
      ? NextResponse.json(
          { success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } },
          { status: 401 }
        )
      : NextResponse.redirect(new URL('/login', request.url));
    
    // Clear invalid token
    response.cookies.delete('auth-token');
    return response;
  }
  
  // Check admin routes
  const adminRoutes = ['/admin', '/api/admin'];
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  
  if (isAdminRoute && payload.role !== 'admin') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Add user info to headers for API routes
  const response = NextResponse.next();
  response.headers.set('x-user-id', payload.userId);
  response.headers.set('x-user-role', payload.role);
  response.headers.set('x-user-email', payload.email);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};