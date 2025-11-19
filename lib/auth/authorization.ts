import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from './jwt';
import { AuthUser } from '@/lib/types';

/**
 * Authorization utilities for API routes
 * Provides reusable functions for checking authentication and authorization
 */

export interface AuthorizationResult {
  authorized: boolean;
  user?: AuthUser;
  response?: NextResponse;
}

/**
 * Check if user is authenticated
 * Returns authorization result with user data or error response
 */
export async function requireAuth(request: NextRequest): Promise<AuthorizationResult> {
  const authResult = await verifyAuth(request);
  
  if (!authResult.valid || !authResult.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'กรุณาเข้าสู่ระบบ',
          },
        },
        { status: 401 }
      ),
    };
  }

  return {
    authorized: true,
    user: authResult.user,
  };
}

/**
 * Check if user is authenticated and has admin role
 * Returns authorization result with user data or error response
 */
export async function requireAdmin(request: NextRequest): Promise<AuthorizationResult> {
  const authResult = await requireAuth(request);
  
  if (!authResult.authorized) {
    return authResult;
  }

  if (authResult.user?.role !== 'admin') {
    return {
      authorized: false,
      user: authResult.user,
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'คุณไม่มีสิทธิ์เข้าถึงฟีเจอร์นี้',
          },
        },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Check if user is authenticated and is the owner of the resource
 * or has admin role
 */
export async function requireOwnerOrAdmin(
  request: NextRequest,
  resourceUserId: string
): Promise<AuthorizationResult> {
  const authResult = await requireAuth(request);
  
  if (!authResult.authorized) {
    return authResult;
  }

  const isOwner = authResult.user?.id === resourceUserId;
  const isAdmin = authResult.user?.role === 'admin';

  if (!isOwner && !isAdmin) {
    return {
      authorized: false,
      user: authResult.user,
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
          },
        },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Check if user has specific role
 */
export function hasRole(user: AuthUser | undefined, role: 'admin' | 'user'): boolean {
  return user?.role === role;
}

/**
 * Check if user is admin
 */
export function isAdmin(user: AuthUser | undefined): boolean {
  return hasRole(user, 'admin');
}

/**
 * Check if user is owner of resource
 */
export function isOwner(user: AuthUser | undefined, resourceUserId: string): boolean {
  return user?.id === resourceUserId;
}

/**
 * Error messages for authorization failures
 */
export const AuthErrorMessages = {
  UNAUTHORIZED: 'กรุณาเข้าสู่ระบบ',
  FORBIDDEN: 'คุณไม่มีสิทธิ์เข้าถึงฟีเจอร์นี้',
  FORBIDDEN_RESOURCE: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
  ADMIN_REQUIRED: 'ต้องมีสิทธิ์ผู้ดูแลระบบ',
} as const;
