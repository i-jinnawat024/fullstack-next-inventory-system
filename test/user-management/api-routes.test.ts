import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getUsers, POST as createUser } from '@/app/api/admin/users/route';
import { 
  GET as getUserById, 
  PUT as updateUser 
} from '@/app/api/admin/users/[id]/route';
import { PUT as updateUserPassword } from '@/app/api/admin/users/[id]/password/route';
import { 
  GET as getProfile, 
  PUT as updateProfile 
} from '@/app/api/profile/route';
import { PUT as changePassword } from '@/app/api/profile/password/route';

// Mock the authorization module
vi.mock('@/lib/auth/authorization', () => ({
  requireAuth: vi.fn(),
  requireAdmin: vi.fn(),
}));

// Mock the user service
vi.mock('@/lib/services/user.service', () => ({
  userService: {
    getAllUsers: vi.fn(),
    getUserById: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    updateUserPassword: vi.fn(),
    getUserProfile: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
  },
}));

import { requireAuth, requireAdmin } from '@/lib/auth/authorization';
import { userService } from '@/lib/services/user.service';
import { UserError, UserErrorCodes } from '@/lib/types/user-management';

const mockRequireAuth = requireAuth as any;
const mockRequireAdmin = requireAdmin as any;
const mockUserService = userService as any;

describe('User Management API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==================== Admin User Management Tests ====================

  describe('GET /api/admin/users', () => {
    it('should return all users for admin', async () => {
      // Mock admin authorization
      mockRequireAdmin.mockResolvedValue({
        authorized: true,
        user: { id: '1', email: 'admin@test.com', role: 'admin' },
      });

      // Mock service response
      const mockUsers = [
        {
          id: '1',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@test.com',
          department: 'IT',
          role: 'admin',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          firstName: 'Regular',
          lastName: 'User',
          email: 'user@test.com',
          department: 'Sales',
          role: 'user',
          isActive: true,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];
      mockUserService.getAllUsers.mockResolvedValue(mockUsers);

      const request = new NextRequest('http://localhost:3000/api/admin/users');
      const response = await getUsers(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.users).toHaveLength(2);
      expect(data.data.users[0].email).toBe('admin@test.com');
      expect(data.data.users[1].email).toBe('user@test.com');
      expect(data.data.total).toBe(2);
      expect(mockUserService.getAllUsers).toHaveBeenCalledWith({ isActive: true });
    });

    it('should return 401 for unauthenticated request', async () => {
      mockRequireAdmin.mockResolvedValue({
        authorized: false,
        response: new Response(
          JSON.stringify({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบ' },
          }),
          { status: 401 }
        ),
      });

      const request = new NextRequest('http://localhost:3000/api/admin/users');
      const response = await getUsers(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 for non-admin user', async () => {
      mockRequireAdmin.mockResolvedValue({
        authorized: false,
        user: { id: '2', email: 'user@test.com', role: 'user' },
        response: new Response(
          JSON.stringify({
            success: false,
            error: { code: 'FORBIDDEN', message: 'คุณไม่มีสิทธิ์เข้าถึงฟีเจอร์นี้' },
          }),
          { status: 403 }
        ),
      });

      const request = new NextRequest('http://localhost:3000/api/admin/users');
      const response = await getUsers(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });
  });

  describe('GET /api/admin/users/[id]', () => {
    it('should return user by ID for admin', async () => {
      mockRequireAdmin.mockResolvedValue({
        authorized: true,
        user: { id: '1', email: 'admin@test.com', role: 'admin' },
      });

      const mockUser = {
        id: '2',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        department: 'IT',
        role: 'user',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      mockUserService.getUserById.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/admin/users/2');
      const response = await getUserById(request, { params: Promise.resolve({ id: '2' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('2');
      expect(data.data.email).toBe('test@test.com');
      expect(data.data.firstName).toBe('Test');
      expect(mockUserService.getUserById).toHaveBeenCalledWith('2');
    });

    it('should return 404 for non-existent user', async () => {
      mockRequireAdmin.mockResolvedValue({
        authorized: true,
        user: { id: '1', email: 'admin@test.com', role: 'admin' },
      });

      mockUserService.getUserById.mockRejectedValue(
        new UserError('ไม่พบข้อมูลผู้ใช้งาน', 404, UserErrorCodes.USER_NOT_FOUND)
      );

      const request = new NextRequest('http://localhost:3000/api/admin/users/999');
      const response = await getUserById(request, { params: Promise.resolve({ id: '999' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(UserErrorCodes.USER_NOT_FOUND);
    });
  });

  describe('POST /api/admin/users', () => {
    it('should create new user for admin', async () => {
      mockRequireAdmin.mockResolvedValue({
        authorized: true,
        user: { id: '1', email: 'admin@test.com', role: 'admin' },
      });

      const newUserData = {
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@test.com',
        password: 'password123',
        department: 'Sales',
        role: 'user' as const,
      };

      const createdUser = {
        id: '3',
        ...newUserData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      delete (createdUser as any).password;

      mockUserService.createUser.mockResolvedValue(createdUser);

      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(newUserData),
      });
      const response = await createUser(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe(newUserData.email);
      expect(data.message).toBe('สร้างผู้ใช้งานสำเร็จ');
    });

    it('should return 400 for missing required fields', async () => {
      mockRequireAdmin.mockResolvedValue({
        authorized: true,
        user: { id: '1', email: 'admin@test.com', role: 'admin' },
      });

      const incompleteData = {
        firstName: 'Test',
        // Missing required fields
      };

      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(incompleteData),
      });
      const response = await createUser(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for duplicate email', async () => {
      mockRequireAdmin.mockResolvedValue({
        authorized: true,
        user: { id: '1', email: 'admin@test.com', role: 'admin' },
      });

      const duplicateUserData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'existing@test.com',
        password: 'password123',
        department: 'IT',
        role: 'user' as const,
      };

      mockUserService.createUser.mockRejectedValue(
        new UserError('อีเมลนี้ถูกใช้งานแล้ว', 400, UserErrorCodes.EMAIL_ALREADY_EXISTS)
      );

      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(duplicateUserData),
      });
      const response = await createUser(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(UserErrorCodes.EMAIL_ALREADY_EXISTS);
    });

    it('should return 400 for invalid password length', async () => {
      mockRequireAdmin.mockResolvedValue({
        authorized: true,
        user: { id: '1', email: 'admin@test.com', role: 'admin' },
      });

      const invalidPasswordData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        password: 'short', // Less than 8 characters
        department: 'IT',
        role: 'user' as const,
      };

      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(invalidPasswordData),
      });
      const response = await createUser(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/admin/users/[id]', () => {
    it('should update user for admin', async () => {
      mockRequireAdmin.mockResolvedValue({
        authorized: true,
        user: { id: '1', email: 'admin@test.com', role: 'admin' },
      });

      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        department: 'Marketing',
      };

      const updatedUser = {
        id: '2',
        ...updateData,
        email: 'user@test.com',
        role: 'user',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      };

      mockUserService.updateUser.mockResolvedValue(updatedUser);

      const request = new NextRequest('http://localhost:3000/api/admin/users/2', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      const response = await updateUser(request, { params: Promise.resolve({ id: '2' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.firstName).toBe('Updated');
      expect(data.message).toBe('อัพเดทข้อมูลผู้ใช้งานสำเร็จ');
    });

    it('should return 404 for non-existent user', async () => {
      mockRequireAdmin.mockResolvedValue({
        authorized: true,
        user: { id: '1', email: 'admin@test.com', role: 'admin' },
      });

      mockUserService.updateUser.mockRejectedValue(
        new UserError('ไม่พบข้อมูลผู้ใช้งาน', 404, UserErrorCodes.USER_NOT_FOUND)
      );

      const request = new NextRequest('http://localhost:3000/api/admin/users/999', {
        method: 'PUT',
        body: JSON.stringify({ firstName: 'Test' }),
      });
      const response = await updateUser(request, { params: Promise.resolve({ id: '999' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(UserErrorCodes.USER_NOT_FOUND);
    });

    it('should return 400 for duplicate email on update', async () => {
      mockRequireAdmin.mockResolvedValue({
        authorized: true,
        user: { id: '1', email: 'admin@test.com', role: 'admin' },
      });

      mockUserService.updateUser.mockRejectedValue(
        new UserError('อีเมลนี้ถูกใช้งานแล้ว', 400, UserErrorCodes.EMAIL_ALREADY_EXISTS)
      );

      const request = new NextRequest('http://localhost:3000/api/admin/users/2', {
        method: 'PUT',
        body: JSON.stringify({ email: 'existing@test.com' }),
      });
      const response = await updateUser(request, { params: Promise.resolve({ id: '2' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(UserErrorCodes.EMAIL_ALREADY_EXISTS);
    });
  });

  describe('PUT /api/admin/users/[id]/password', () => {
    it('should reset user password for admin', async () => {
      mockRequireAdmin.mockResolvedValue({
        authorized: true,
        user: { id: '1', email: 'admin@test.com', role: 'admin' },
      });

      mockUserService.updateUserPassword.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/admin/users/2/password', {
        method: 'PUT',
        body: JSON.stringify({ newPassword: 'newpassword123' }),
      });
      const response = await updateUserPassword(request, { params: Promise.resolve({ id: '2' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('เปลี่ยนรหัสผ่านสำเร็จ');
      expect(mockUserService.updateUserPassword).toHaveBeenCalledWith('2', 'newpassword123');
    });

    it('should return 400 for invalid password length', async () => {
      mockRequireAdmin.mockResolvedValue({
        authorized: true,
        user: { id: '1', email: 'admin@test.com', role: 'admin' },
      });

      const request = new NextRequest('http://localhost:3000/api/admin/users/2/password', {
        method: 'PUT',
        body: JSON.stringify({ newPassword: 'short' }),
      });
      const response = await updateUserPassword(request, { params: Promise.resolve({ id: '2' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent user', async () => {
      mockRequireAdmin.mockResolvedValue({
        authorized: true,
        user: { id: '1', email: 'admin@test.com', role: 'admin' },
      });

      mockUserService.updateUserPassword.mockRejectedValue(
        new UserError('ไม่พบข้อมูลผู้ใช้งาน', 404, UserErrorCodes.USER_NOT_FOUND)
      );

      const request = new NextRequest('http://localhost:3000/api/admin/users/999/password', {
        method: 'PUT',
        body: JSON.stringify({ newPassword: 'newpassword123' }),
      });
      const response = await updateUserPassword(request, { params: Promise.resolve({ id: '999' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(UserErrorCodes.USER_NOT_FOUND);
    });
  });

  // ==================== User Profile Tests ====================

  describe('GET /api/profile', () => {
    it('should return current user profile', async () => {
      mockRequireAuth.mockResolvedValue({
        authorized: true,
        user: { id: '2', email: 'user@test.com', role: 'user' },
      });

      const mockProfile = {
        id: '2',
        firstName: 'Test',
        lastName: 'User',
        email: 'user@test.com',
        department: 'Sales',
        role: 'user',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      mockUserService.getUserProfile.mockResolvedValue(mockProfile);

      const request = new NextRequest('http://localhost:3000/api/profile');
      const response = await getProfile(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('2');
      expect(data.data.email).toBe('user@test.com');
      expect(data.data.firstName).toBe('Test');
      expect(mockUserService.getUserProfile).toHaveBeenCalledWith('2');
    });

    it('should return 401 for unauthenticated request', async () => {
      mockRequireAuth.mockResolvedValue({
        authorized: false,
        response: new Response(
          JSON.stringify({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบ' },
          }),
          { status: 401 }
        ),
      });

      const request = new NextRequest('http://localhost:3000/api/profile');
      const response = await getProfile(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('PUT /api/profile', () => {
    it('should update current user profile', async () => {
      mockRequireAuth.mockResolvedValue({
        authorized: true,
        user: { id: '2', email: 'user@test.com', role: 'user' },
      });

      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        email: 'newemail@test.com',
      };

      const updatedProfile = {
        id: '2',
        ...updateData,
        department: 'Sales',
        role: 'user',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      };

      mockUserService.updateProfile.mockResolvedValue(updatedProfile);

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      const response = await updateProfile(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.firstName).toBe('Updated');
      expect(data.message).toBe('อัพเดทข้อมูลโปรไฟล์สำเร็จ');
      expect(mockUserService.updateProfile).toHaveBeenCalledWith('2', updateData);
    });

    it('should return 400 for duplicate email', async () => {
      mockRequireAuth.mockResolvedValue({
        authorized: true,
        user: { id: '2', email: 'user@test.com', role: 'user' },
      });

      mockUserService.updateProfile.mockRejectedValue(
        new UserError('อีเมลนี้ถูกใช้งานแล้ว', 400, UserErrorCodes.EMAIL_ALREADY_EXISTS)
      );

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ email: 'existing@test.com' }),
      });
      const response = await updateProfile(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(UserErrorCodes.EMAIL_ALREADY_EXISTS);
    });

    it('should return 400 for invalid email format', async () => {
      mockRequireAuth.mockResolvedValue({
        authorized: true,
        user: { id: '2', email: 'user@test.com', role: 'user' },
      });

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ email: 'invalid-email' }),
      });
      const response = await updateProfile(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/profile/password', () => {
    it('should change user password', async () => {
      mockRequireAuth.mockResolvedValue({
        authorized: true,
        user: { id: '2', email: 'user@test.com', role: 'user' },
      });

      mockUserService.changePassword.mockResolvedValue(undefined);

      const passwordData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };

      const request = new NextRequest('http://localhost:3000/api/profile/password', {
        method: 'PUT',
        body: JSON.stringify(passwordData),
      });
      const response = await changePassword(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('เปลี่ยนรหัสผ่านสำเร็จ');
      expect(mockUserService.changePassword).toHaveBeenCalledWith(
        '2',
        'oldpassword123',
        'newpassword123'
      );
    });

    it('should return 400 for incorrect current password', async () => {
      mockRequireAuth.mockResolvedValue({
        authorized: true,
        user: { id: '2', email: 'user@test.com', role: 'user' },
      });

      mockUserService.changePassword.mockRejectedValue(
        new UserError('รหัสผ่านปัจจุบันไม่ถูกต้อง', 400, UserErrorCodes.INVALID_PASSWORD)
      );

      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };

      const request = new NextRequest('http://localhost:3000/api/profile/password', {
        method: 'PUT',
        body: JSON.stringify(passwordData),
      });
      const response = await changePassword(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(UserErrorCodes.INVALID_PASSWORD);
    });

    it('should return 400 for password mismatch', async () => {
      mockRequireAuth.mockResolvedValue({
        authorized: true,
        user: { id: '2', email: 'user@test.com', role: 'user' },
      });

      const passwordData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123',
        confirmPassword: 'differentpassword',
      };

      const request = new NextRequest('http://localhost:3000/api/profile/password', {
        method: 'PUT',
        body: JSON.stringify(passwordData),
      });
      const response = await changePassword(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid new password length', async () => {
      mockRequireAuth.mockResolvedValue({
        authorized: true,
        user: { id: '2', email: 'user@test.com', role: 'user' },
      });

      const passwordData = {
        currentPassword: 'oldpassword123',
        newPassword: 'short',
        confirmPassword: 'short',
      };

      const request = new NextRequest('http://localhost:3000/api/profile/password', {
        method: 'PUT',
        body: JSON.stringify(passwordData),
      });
      const response = await changePassword(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
