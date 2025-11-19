import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  requireAuth,
  requireAdmin,
  requireOwnerOrAdmin,
  hasRole,
  isAdmin,
  isOwner,
} from '@/lib/auth/authorization';
import { verifyAuth } from '@/lib/auth/jwt';
import { AuthUser } from '@/lib/types';

// Mock the JWT verification
vi.mock('@/lib/auth/jwt', () => ({
  verifyAuth: vi.fn(),
}));

describe('Authorization Utilities', () => {
  const mockAdminUser: AuthUser = {
    id: 'admin-123',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    department: 'IT',
  };

  const mockRegularUser: AuthUser = {
    id: 'user-123',
    email: 'user@example.com',
    name: 'Regular User',
    role: 'user',
    department: 'Sales',
  };

  describe('requireAuth', () => {
    it('should return authorized for valid user', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        valid: true,
        user: mockRegularUser,
      });

      const request = new NextRequest('http://localhost/api/test');
      const result = await requireAuth(request);

      expect(result.authorized).toBe(true);
      expect(result.user).toEqual(mockRegularUser);
      expect(result.response).toBeUndefined();
    });

    it('should return unauthorized for invalid auth', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        valid: false,
        error: 'Invalid token',
      });

      const request = new NextRequest('http://localhost/api/test');
      const result = await requireAuth(request);

      expect(result.authorized).toBe(false);
      expect(result.response).toBeDefined();
      
      const json = await result.response!.json();
      expect(json.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('requireAdmin', () => {
    it('should return authorized for admin user', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        valid: true,
        user: mockAdminUser,
      });

      const request = new NextRequest('http://localhost/api/admin/test');
      const result = await requireAdmin(request);

      expect(result.authorized).toBe(true);
      expect(result.user).toEqual(mockAdminUser);
    });

    it('should return forbidden for regular user', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        valid: true,
        user: mockRegularUser,
      });

      const request = new NextRequest('http://localhost/api/admin/test');
      const result = await requireAdmin(request);

      expect(result.authorized).toBe(false);
      expect(result.response).toBeDefined();
      
      const json = await result.response!.json();
      expect(json.error.code).toBe('FORBIDDEN');
    });

    it('should return unauthorized for unauthenticated user', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        valid: false,
        error: 'No token',
      });

      const request = new NextRequest('http://localhost/api/admin/test');
      const result = await requireAdmin(request);

      expect(result.authorized).toBe(false);
      
      const json = await result.response!.json();
      expect(json.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('requireOwnerOrAdmin', () => {
    it('should return authorized for resource owner', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        valid: true,
        user: mockRegularUser,
      });

      const request = new NextRequest('http://localhost/api/profile');
      const result = await requireOwnerOrAdmin(request, 'user-123');

      expect(result.authorized).toBe(true);
      expect(result.user).toEqual(mockRegularUser);
    });

    it('should return authorized for admin accessing other user resource', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        valid: true,
        user: mockAdminUser,
      });

      const request = new NextRequest('http://localhost/api/profile');
      const result = await requireOwnerOrAdmin(request, 'user-123');

      expect(result.authorized).toBe(true);
      expect(result.user).toEqual(mockAdminUser);
    });

    it('should return forbidden for non-owner non-admin', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        valid: true,
        user: mockRegularUser,
      });

      const request = new NextRequest('http://localhost/api/profile');
      const result = await requireOwnerOrAdmin(request, 'other-user-123');

      expect(result.authorized).toBe(false);
      
      const json = await result.response!.json();
      expect(json.error.code).toBe('FORBIDDEN');
    });
  });

  describe('hasRole', () => {
    it('should return true for matching role', () => {
      expect(hasRole(mockAdminUser, 'admin')).toBe(true);
      expect(hasRole(mockRegularUser, 'user')).toBe(true);
    });

    it('should return false for non-matching role', () => {
      expect(hasRole(mockAdminUser, 'user')).toBe(false);
      expect(hasRole(mockRegularUser, 'admin')).toBe(false);
    });

    it('should return false for undefined user', () => {
      expect(hasRole(undefined, 'admin')).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin user', () => {
      expect(isAdmin(mockAdminUser)).toBe(true);
    });

    it('should return false for regular user', () => {
      expect(isAdmin(mockRegularUser)).toBe(false);
    });

    it('should return false for undefined user', () => {
      expect(isAdmin(undefined)).toBe(false);
    });
  });

  describe('isOwner', () => {
    it('should return true for resource owner', () => {
      expect(isOwner(mockRegularUser, 'user-123')).toBe(true);
    });

    it('should return false for non-owner', () => {
      expect(isOwner(mockRegularUser, 'other-user-123')).toBe(false);
    });

    it('should return false for undefined user', () => {
      expect(isOwner(undefined, 'user-123')).toBe(false);
    });
  });
});
