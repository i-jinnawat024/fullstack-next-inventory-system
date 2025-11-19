import { NextRequest, NextResponse } from 'next/server';
import {
  verifyToken,
  verifyRefreshToken,
  generateAuthTokens,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from '@/lib/auth/jwt';
import { AuthUser, JWTPayload } from '@/lib/types';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/forgot-password',
  '/api/auth/login',
  '/api/auth/forgot',
  '/api/auth/refresh',
  '/api/auth/verify',
];

// Admin-only routes that require admin role
const ADMIN_ROUTES = ['/admin', '/api/admin'];

interface AuthSuccess {
  ok: true;
  payload: JWTPayload;
  response: NextResponse;
}

interface AuthFailure {
  ok: false;
  response: NextResponse;
}

type AuthResult = AuthSuccess | AuthFailure;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('auth-token')?.value ?? null;
  const refreshToken = request.cookies.get('refresh-token')?.value ?? null;

  const authResult = authenticateRequest(request, { accessToken, refreshToken });
  if (!authResult.ok) {
    return authResult.response;
  }

  const { payload, response } = authResult;

  // Check if route requires admin role
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
  if (isAdminRoute && payload.role !== 'admin') {
    return handleForbidden(request);
  }

  // Set user information in headers for server components and API routes
  response.headers.set('x-user-id', payload.userId);
  response.headers.set('x-user-role', payload.role);
  response.headers.set('x-user-email', payload.email);
  // Encode Unicode characters (e.g., Thai) to base64 for header compatibility
  response.headers.set('x-user-name', Buffer.from(payload.name, 'utf8').toString('base64'));
  response.headers.set('x-user-department', Buffer.from(payload.department, 'utf8').toString('base64'));

  return response;
}

function authenticateRequest(
  request: NextRequest,
  tokens: { accessToken: string | null; refreshToken: string | null }
): AuthResult {
  if (tokens.accessToken) {
    const payload = verifyToken(tokens.accessToken);
    if (payload) {
      return { ok: true, payload, response: NextResponse.next() };
    }
  }

  if (tokens.refreshToken) {
    const refreshPayload = verifyRefreshToken(tokens.refreshToken);
    if (!refreshPayload) {
      const invalidRefreshResponse = createUnauthorizedResponse(
        request,
        401,
        'INVALID_TOKEN',
        'Token ไม่ถูกต้องหรือหมดอายุแล้ว'
      );
      invalidRefreshResponse.cookies.delete('auth-token');
      invalidRefreshResponse.cookies.delete('refresh-token');
      return { ok: false, response: invalidRefreshResponse };
    }

    const authUser: AuthUser = {
      id: refreshPayload.userId,
      email: refreshPayload.email,
      name: refreshPayload.name,
      role: refreshPayload.role,
      department: refreshPayload.department,
    };

    const { accessToken, refreshToken } = generateAuthTokens(authUser);
    const payload = verifyToken(accessToken);
    if (!payload) {
      const invalidResponse = createUnauthorizedResponse(
        request,
        401,
        'INVALID_TOKEN',
        'Token ไม่ถูกต้องหรือหมดอายุแล้ว'
      );
      invalidResponse.cookies.delete('auth-token');
      invalidResponse.cookies.delete('refresh-token');
      return { ok: false, response: invalidResponse };
    }

    const response = NextResponse.next();
    setAuthCookies(response, accessToken, refreshToken);
    return { ok: true, payload, response };
  }

  const unauthorized = createUnauthorizedResponse(request, 401, 'UNAUTHORIZED', 'กรุณาเข้าสู่ระบบ');
  if (tokens.accessToken) unauthorized.cookies.delete('auth-token');
  if (tokens.refreshToken) unauthorized.cookies.delete('refresh-token');
  return { ok: false, response: unauthorized };
}

function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  const commonOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };

  response.cookies.set('auth-token', accessToken, {
    ...commonOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  response.cookies.set('refresh-token', refreshToken, {
    ...commonOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

function createUnauthorizedResponse(
  request: NextRequest,
  status: number,
  code: string,
  message: string
): NextResponse {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json(
      { success: false, error: { code, message } },
      { status }
    );
  }

  return NextResponse.redirect(new URL('/login', request.url));
}

function handleForbidden(request: NextRequest): NextResponse {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'ต้องมีสิทธิ์ผู้ดูแลระบบ' } },
      { status: 403 }
    );
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
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
