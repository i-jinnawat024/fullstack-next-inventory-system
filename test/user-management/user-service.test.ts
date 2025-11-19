import { describe, it, expect, beforeEach } from 'vitest';
import { userService } from '@/lib/services/user.service';
import { userDb } from '@/lib/database/user-database';
import { UserErrorCodes } from '@/lib/types/user-management';

describe('UserService', () => {
  beforeEach(() => {
    // Reset database to initial state before each test
    userDb.reset();
  });

  describe('Admin Operations', () => {
    describe('getAllUsers', () => {
      it('should return all active users', async () => {
        const users = await userService.getAllUsers({ isActive: true });
        
        expect(users).toBeDefined();
        expect(users.length).toBeGreaterThan(0);
        expect(users[0]).not.toHaveProperty('password');
      });

      it('should return users sorted by createdAt descending', async () => {
        const users = await userService.getAllUsers();
        
        for (let i = 0; i < users.length - 1; i++) {
          const current = new Date(users[i].createdAt).getTime();
          const next = new Date(users[i + 1].createdAt).getTime();
          expect(current).toBeGreaterThanOrEqual(next);
        }
      });
    });

    describe('getUserById', () => {
      it('should return user by ID without password', async () => {
        const user = await userService.getUserById('1');
        
        expect(user).toBeDefined();
        expect(user.id).toBe('1');
        expect(user).not.toHaveProperty('password');
      });

      it('should throw error if user not found', async () => {
        await expect(userService.getUserById('999')).rejects.toThrow('ไม่พบข้อมูลผู้ใช้งาน');
      });
    });

    describe('createUser', () => {
      it('should create a new user with hashed password', async () => {
        const newUser = await userService.createUser({
          firstName: 'ทดสอบ',
          lastName: 'ผู้ใช้',
          email: 'test@company.com',
          password: 'password123',
          department: 'IT',
          role: 'user',
        });

        expect(newUser).toBeDefined();
        expect(newUser.email).toBe('test@company.com');
        expect(newUser).not.toHaveProperty('password');
      });

      it('should throw error if email already exists', async () => {
        await expect(
          userService.createUser({
            firstName: 'ทดสอบ',
            lastName: 'ผู้ใช้',
            email: 'admin@company.com', // Already exists
            password: 'password123',
            department: 'IT',
            role: 'user',
          })
        ).rejects.toThrow('อีเมลนี้ถูกใช้งานแล้ว');
      });
    });

    describe('updateUser', () => {
      it('should update user information', async () => {
        const updatedUser = await userService.updateUser('1', {
          firstName: 'อัพเดท',
          department: 'HR',
        });

        expect(updatedUser.firstName).toBe('อัพเดท');
        expect(updatedUser.department).toBe('HR');
      });

      it('should throw error if user not found', async () => {
        await expect(
          userService.updateUser('999', { firstName: 'Test' })
        ).rejects.toThrow('ไม่พบข้อมูลผู้ใช้งาน');
      });

      it('should throw error if email already exists', async () => {
        await expect(
          userService.updateUser('2', { email: 'admin@company.com' })
        ).rejects.toThrow('อีเมลนี้ถูกใช้งานแล้ว');
      });
    });

    describe('updateUserPassword', () => {
      it('should update user password', async () => {
        await expect(
          userService.updateUserPassword('1', 'newpassword123')
        ).resolves.not.toThrow();
      });

      it('should throw error if user not found', async () => {
        await expect(
          userService.updateUserPassword('999', 'newpassword123')
        ).rejects.toThrow('ไม่พบข้อมูลผู้ใช้งาน');
      });
    });
  });

  describe('User Profile Operations', () => {
    describe('getUserProfile', () => {
      it('should return user profile without password', async () => {
        const profile = await userService.getUserProfile('1');
        
        expect(profile).toBeDefined();
        expect(profile.id).toBe('1');
        expect(profile).not.toHaveProperty('password');
      });

      it('should throw error if user not found', async () => {
        await expect(userService.getUserProfile('999')).rejects.toThrow('ไม่พบข้อมูลผู้ใช้งาน');
      });
    });

    describe('updateProfile', () => {
      it('should update user profile', async () => {
        const updatedProfile = await userService.updateProfile('1', {
          firstName: 'อัพเดท',
          lastName: 'โปรไฟล์',
        });

        expect(updatedProfile.firstName).toBe('อัพเดท');
        expect(updatedProfile.lastName).toBe('โปรไฟล์');
      });

      it('should throw error if email already exists', async () => {
        await expect(
          userService.updateProfile('2', { email: 'admin@company.com' })
        ).rejects.toThrow('อีเมลนี้ถูกใช้งานแล้ว');
      });
    });

    describe('changePassword', () => {
      it('should change password with correct current password', async () => {
        await expect(
          userService.changePassword('1', 'password', 'newpassword123')
        ).resolves.not.toThrow();
      });

      it('should throw error if current password is incorrect', async () => {
        await expect(
          userService.changePassword('1', 'wrongpassword', 'newpassword123')
        ).rejects.toThrow('รหัสผ่านปัจจุบันไม่ถูกต้อง');
      });

      it('should throw error if user not found', async () => {
        await expect(
          userService.changePassword('999', 'password', 'newpassword123')
        ).rejects.toThrow('ไม่พบข้อมูลผู้ใช้งาน');
      });
    });
  });

  describe('Validation Helper Methods', () => {
    describe('validateEmail', () => {
      it('should return true if email is available', async () => {
        const isAvailable = await userService.validateEmail('newemail@company.com');
        expect(isAvailable).toBe(true);
      });

      it('should return false if email already exists', async () => {
        const isAvailable = await userService.validateEmail('admin@company.com');
        expect(isAvailable).toBe(false);
      });

      it('should return true if email belongs to excluded user', async () => {
        const isAvailable = await userService.validateEmail('admin@company.com', '1');
        expect(isAvailable).toBe(true);
      });
    });

    describe('validatePassword', () => {
      it('should return true for correct password', async () => {
        const isValid = await userService.validatePassword('1', 'password');
        expect(isValid).toBe(true);
      });

      it('should return false for incorrect password', async () => {
        const isValid = await userService.validatePassword('1', 'wrongpassword');
        expect(isValid).toBe(false);
      });

      it('should return false if user not found', async () => {
        const isValid = await userService.validatePassword('999', 'password');
        expect(isValid).toBe(false);
      });
    });
  });
});
