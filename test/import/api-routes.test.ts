import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/import/route';

// Mock the auth verification
vi.mock('@/lib/auth/jwt', () => ({
  verifyAuth: vi.fn(),
}));

// Mock the database
vi.mock('@/lib/database/mock-database', () => ({
  mockDb: {
    findAllInventory: vi.fn(),
    createInventoryItem: vi.fn(),
  },
}));

import { verifyAuth } from '@/lib/auth/jwt';
import { mockDb } from '@/lib/database/mock-database';

const mockVerifyAuth = verifyAuth as any;
const mockDatabase = mockDb as any;

describe('Import API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/import', () => {
    it('should import valid CSV data successfully', async () => {
      mockVerifyAuth.mockResolvedValue({
        valid: true,
        user: { id: '1', role: 'admin' },
      });

      const importData = [
        {
          code: 'IMP-001',
          name: 'สินค้านำเข้า 1',
          description: 'รายละเอียด 1',
          category: 'หมวดหมู่ 1',
          unit: 'ชิ้น',
          currentStock: 100,
          minimumStock: 10,
        },
        {
          code: 'IMP-002',
          name: 'สินค้านำเข้า 2',
          description: 'รายละเอียด 2',
          category: 'หมวดหมู่ 2',
          unit: 'กล่อง',
          currentStock: 50,
          minimumStock: 5,
        },
      ];

      mockDatabase.findAllInventory.mockResolvedValue([]);
      mockDatabase.createInventoryItem.mockResolvedValue({ id: '1' });

      const request = new NextRequest('http://localhost:3000/api/import', {
        method: 'POST',
        body: JSON.stringify({ data: importData }),
      });
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.imported).toBe(2);
      expect(result.data.errors).toHaveLength(0);
      expect(mockDatabase.createInventoryItem).toHaveBeenCalledTimes(2);
    });

    it('should validate required fields', async () => {
      mockVerifyAuth.mockResolvedValue({
        valid: true,
        user: { id: '1', role: 'admin' },
      });

      const importData = [
        {
          code: '',
          name: 'สินค้านำเข้า',
          description: 'รายละเอียด',
          category: 'หมวดหมู่',
          unit: 'ชิ้น',
          currentStock: 100,
          minimumStock: 10,
        },
      ];

      mockDatabase.findAllInventory.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/import', {
        method: 'POST',
        body: JSON.stringify({ data: importData }),
      });
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.imported).toBe(0);
      expect(result.data.errors.length).toBeGreaterThan(0);
      expect(result.data.errors[0].message).toContain('รหัสสินค้า');
    });

    it('should detect duplicate product codes', async () => {
      mockVerifyAuth.mockResolvedValue({
        valid: true,
        user: { id: '1', role: 'admin' },
      });

      const importData = [
        {
          code: 'EXISTING-001',
          name: 'สินค้านำเข้า',
          description: 'รายละเอียด',
          category: 'หมวดหมู่',
          unit: 'ชิ้น',
          currentStock: 100,
          minimumStock: 10,
        },
      ];

      mockDatabase.findAllInventory.mockResolvedValue([
        { id: '1', code: 'EXISTING-001', name: 'สินค้าเดิม' },
      ]);

      const request = new NextRequest('http://localhost:3000/api/import', {
        method: 'POST',
        body: JSON.stringify({ data: importData }),
      });
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.imported).toBe(0);
      expect(result.data.errors.length).toBeGreaterThan(0);
      expect(result.data.errors[0].message).toContain('มีอยู่ในระบบแล้ว');
    });

    it('should validate numeric fields', async () => {
      mockVerifyAuth.mockResolvedValue({
        valid: true,
        user: { id: '1', role: 'admin' },
      });

      const importData = [
        {
          code: 'TEST-001',
          name: 'สินค้าทดสอบ',
          description: 'รายละเอียด',
          category: 'หมวดหมู่',
          unit: 'ชิ้น',
          currentStock: -10,
          minimumStock: 5,
        },
      ];

      mockDatabase.findAllInventory.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/import', {
        method: 'POST',
        body: JSON.stringify({ data: importData }),
      });
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.imported).toBe(0);
      expect(result.data.errors.length).toBeGreaterThan(0);
      expect(result.data.errors[0].message).toContain('สต็อกปัจจุบัน');
    });

    it('should return 403 for non-admin user', async () => {
      mockVerifyAuth.mockResolvedValue({
        valid: true,
        user: { id: '1', role: 'user' },
      });

      const request = new NextRequest('http://localhost:3000/api/import', {
        method: 'POST',
        body: JSON.stringify({ data: [] }),
      });
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 400 for invalid data format', async () => {
      mockVerifyAuth.mockResolvedValue({
        valid: true,
        user: { id: '1', role: 'admin' },
      });

      const request = new NextRequest('http://localhost:3000/api/import', {
        method: 'POST',
        body: JSON.stringify({ data: null }),
      });
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('INVALID_DATA');
    });

    it('should handle partial import with mixed valid and invalid rows', async () => {
      mockVerifyAuth.mockResolvedValue({
        valid: true,
        user: { id: '1', role: 'admin' },
      });

      const importData = [
        {
          code: 'VALID-001',
          name: 'สินค้าถูกต้อง',
          description: 'รายละเอียด',
          category: 'หมวดหมู่',
          unit: 'ชิ้น',
          currentStock: 100,
          minimumStock: 10,
        },
        {
          code: '',
          name: 'สินค้าผิด',
          description: 'รายละเอียด',
          category: 'หมวดหมู่',
          unit: 'ชิ้น',
          currentStock: 50,
          minimumStock: 5,
        },
      ];

      mockDatabase.findAllInventory.mockResolvedValue([]);
      mockDatabase.createInventoryItem.mockResolvedValue({ id: '1' });

      const request = new NextRequest('http://localhost:3000/api/import', {
        method: 'POST',
        body: JSON.stringify({ data: importData }),
      });
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.imported).toBe(1);
      expect(result.data.errors.length).toBeGreaterThan(0);
      expect(mockDatabase.createInventoryItem).toHaveBeenCalledTimes(1);
    });
  });
});
