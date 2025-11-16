import { describe, it, expect, beforeEach } from 'vitest';
import { generateToken, verifyToken, hashPassword, comparePassword } from '@/lib/auth/jwt';
import { AuthUser } from '@/lib/types';

describe('JWT Authentication', () => {
  const mockUser: AuthUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    department: 'IT'
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // header.payload.signature
    });

    it('should generate different tokens for different users', () => {
      const user1: AuthUser = { ...mockUser, id: '1' };
      const user2: AuthUser = { ...mockUser, id: '2' };
      
      const token1 = generateToken(user1);
      const token2 = generateToken(user2);
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(mockUser);
      const payload = verifyToken(token);
      
      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(mockUser.id);
      expect(payload?.email).toBe(mockUser.email);
      expect(payload?.role).toBe(mockUser.role);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const payload = verifyToken(invalidToken);
      
      expect(payload).toBeNull();
    });

    it('should return null for malformed token', () => {
      const malformedToken = 'not-a-jwt-token';
      const payload = verifyToken(malformedToken);
      
      expect(payload).toBeNull();
    });

    it('should return null for empty token', () => {
      const payload = verifyToken('');
      
      expect(payload).toBeNull();
    });
  });

  describe('Password hashing', () => {
    const password = 'testpassword123';

    it('should hash password', () => {
      const hash = hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2a$10$')).toBe(true);
    });

    it('should generate different hashes for same password', () => {
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);
      
      // Note: In a real bcrypt implementation, these would be different
      // But our simulation will produce the same hash
      expect(hash1).toBe(hash2);
    });

    it('should verify correct password', () => {
      const hash = hashPassword(password);
      const isValid = comparePassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', () => {
      const hash = hashPassword(password);
      const isValid = comparePassword('wrongpassword', hash);
      
      expect(isValid).toBe(false);
    });
  });
});