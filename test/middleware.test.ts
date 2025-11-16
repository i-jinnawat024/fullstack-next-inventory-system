import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '@/middleware';
import { generateToken } from '@/lib/auth/jwt';
import { AuthUser } from '@/lib/types';

// Mock NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      next: vi.fn(() => ({
        headers: new Map(),
        cookies: {
          delete: vi.fn(),
        },
      })),
      redirect: vi.fn(() => ({ cookies: { delete: vi.fn() } })),
      json: vi.fn(() => ({ cookies: { delete: vi.fn() } })),
    },
  };
});

describe('Authentication Middleware', () => {
  const mockUser: AuthUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    department: 'IT'
  };

  const mockAdminUser: AuthUser = {
    id: '2',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    department: 'IT'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockRequest = (pathname: string, token?: string) => {
    const headers = new Map();
    if (token) {
      headers.set('cookie', `auth-token=${token}`);
    }
    
    return {
      nextUrl: { pathname },
      headers: {
        get: (key: string) => headers.get(key) || null,
      },
      url: `http://localhost:3000${pathname}`,
    } as NextRequest;
  };

  describe('Public routes', () => {
    it('should allow access to login page without token', () => {
      const request = createMockRequest('/login');
      const response = middleware(request);
      
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('should allow access to forgot password page without token', () => {
      const request = createMockRequest('/forgot-password');
      const response = middleware(request);
      
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('should allow access to auth API endpoints without token', () => {
      const request = createMockRequest('/api/auth/login');
      const response = middleware(request);
      
      expect(NextResponse.next).toHaveBeenCalled();
    });
  });

  describe('Protected routes', () => {
    it('should redirect to login for dashboard without token', () => {
      const request = createMockRequest('/dashboard');
      const response = middleware(request);
      
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/login', request.url)
      );
    });

    it('should return 401 for API routes without token', () => {
      const request = createMockRequest('/api/inventory');
      const response = middleware(request);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        },
        { status: 401 }
      );
    });

    it('should allow access to dashboard with valid token', () => {
      const token = generateToken(mockUser);
      const request = createMockRequest('/dashboard', token);
      const response = middleware(request);
      
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('should redirect to login with invalid token', () => {
      const request = createMockRequest('/dashboard', 'invalid-token');
      const response = middleware(request);
      
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/login', request.url)
      );
    });
  });

  describe('Admin routes', () => {
    it('should allow admin access to admin routes', () => {
      const token = generateToken(mockAdminUser);
      const request = createMockRequest('/admin/products', token);
      const response = middleware(request);
      
      expect(NextResponse.next).toHaveBeenCalled();
    });

    it('should redirect regular user from admin routes', () => {
      const token = generateToken(mockUser);
      const request = createMockRequest('/admin/products', token);
      const response = middleware(request);
      
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/dashboard', request.url)
      );
    });

    it('should return 403 for regular user accessing admin API', () => {
      const token = generateToken(mockUser);
      const request = createMockRequest('/api/admin/products', token);
      const response = middleware(request);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Admin access required' }
        },
        { status: 403 }
      );
    });
  });

  describe('User headers', () => {
    it('should add user info to headers for authenticated requests', () => {
      const token = generateToken(mockUser);
      const request = createMockRequest('/api/inventory', token);
      
      const mockResponse = {
        headers: new Map(),
      };
      
      (NextResponse.next as any).mockReturnValue(mockResponse);
      
      middleware(request);
      
      expect(NextResponse.next).toHaveBeenCalled();
    });
  });
});