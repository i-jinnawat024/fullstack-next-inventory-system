import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/inventory/route';
import { GET as getById, PATCH, DELETE } from '@/app/api/inventory/[id]/route';

// Mock the auth verification
vi.mock('@/lib/auth/jwt', () => ({
  verifyAuth: vi.fn(),
}));

// Mock the database
vi.mock('@/lib/database/mock-database', () => ({
  mockDb: {
    findAllInventory: vi.fn(),
    findInventoryById: vi.fn(),
    createInventoryItem: vi.fn(),
    updateInventoryItem: vi.fn(),
    deleteInventoryItem: vi.fn(),
  },
}));

import { verifyAuth } from '@/lib/auth/jwt';
import { mockDb } from '@/lib/database/mock-database';

const mockVerifyAuth = verifyAuth as any;
const mockDatabase = mockDb as any;

describe('Inventory API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/inventory', () => {
    it('should return inventory items for authenticated user', async () => {
      // Mock successful authentication
      mockVerifyAuth.mockResolvedValue({
        success: true,
        user: { id: '1', role: 'user' },
      });

      // Mock database response
      const mockInventory = [
        {
          id: '1',
          code: 'TEST-001',
          name: 'สินค้าทดสอบ',
          category: 'ทดสอบ',
          currentStock: 100,
        },
      ];
      mockDatabase.findAllInventory.mockResolvedValue(mockInventory);

      const request = new NextRequest('http://localhost:3000/api/inventory');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockInventory);
      expect(mockDatabase.findAllInventory).toHaveBeenCalledWith({
        search: undefined,
        category: undefined,
        stockStatus: undefined,
      });
    });

    it('should apply search filters', async () => {
      mockVerifyAuth.mockResolvedValue({
        success: true,
        user: { id: '1', role: 'user' },
      });
      mockDatabase.findAllInventory.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/inventory?search=ปากกา&category=เครื่องเขียน&stockStatus=in-stock');
      await GET(request);

      expect(mockDatabase.findAllInventory).toHaveBeenCalledWith({
        search: 'ปากกา',
        category: 'เครื่องเขียน',
        stockStatus: 'in-stock',
      });
    });

    it('should return 401 for unauthenticated request', async () => {
      mockVerifyAuth.mockResolvedValue({
        success: false,
        error: 'Invalid token',
      });

      const request = new NextRequest('http://localhost:3000/api/inventory');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/inventory', () => {
    it('should create inventory item for admin user', async () => {
      mockVerifyAuth.mockResolvedValue({
        success: true,
        user: { id: '1', role: 'admin' },
      });

      const newItem = {
        code: 'NEW-001',
        name: 'สินค้าใหม่',
        description: 'รายละเอียด',
        category: 'ทดสอบ',
        unit: 'ชิ้น',
        currentStock: 50,
        minimumStock: 5,
      };

      const createdItem = { ...newItem, id: '10', createdAt: new Date(), updatedAt: new Date() };
      mockDatabase.findAllInventory.mockResolvedValue([]); // No existing items with same code
      mockDatabase.createInventoryItem.mockResolvedValue(createdItem);

      const request = new NextRequest('http://localhost:3000/api/inventory', {
        method: 'POST',
        body: JSON.stringify(newItem),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(createdItem.id);
      expect(data.data.code).toBe(createdItem.code);
      expect(data.data.name).toBe(createdItem.name);
      expect(mockDatabase.createInventoryItem).toHaveBeenCalledWith({
        ...newItem,
        isActive: true,
      });
    });

    it('should return 403 for non-admin user', async () => {
      mockVerifyAuth.mockResolvedValue({
        success: true,
        user: { id: '1', role: 'user' },
      });

      const request = new NextRequest('http://localhost:3000/api/inventory', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('should return 400 for missing required fields', async () => {
      mockVerifyAuth.mockResolvedValue({
        success: true,
        user: { id: '1', role: 'admin' },
      });

      const incompleteItem = {
        code: 'TEST-001',
        // Missing required fields
      };

      const request = new NextRequest('http://localhost:3000/api/inventory', {
        method: 'POST',
        body: JSON.stringify(incompleteItem),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for duplicate product code', async () => {
      mockVerifyAuth.mockResolvedValue({
        success: true,
        user: { id: '1', role: 'admin' },
      });

      const newItem = {
        code: 'EXISTING-001',
        name: 'สินค้าใหม่',
        description: 'รายละเอียด',
        category: 'ทดสอบ',
        unit: 'ชิ้น',
        currentStock: 50,
        minimumStock: 5,
      };

      // Mock existing item with same code
      mockDatabase.findAllInventory.mockResolvedValue([
        { id: '1', code: 'EXISTING-001', name: 'สินค้าเดิม' },
      ]);

      const request = new NextRequest('http://localhost:3000/api/inventory', {
        method: 'POST',
        body: JSON.stringify(newItem),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('DUPLICATE_CODE');
    });
  });

  describe('GET /api/inventory/[id]', () => {
    it('should return specific inventory item', async () => {
      mockVerifyAuth.mockResolvedValue({
        success: true,
        user: { id: '1', role: 'user' },
      });

      const mockItem = {
        id: '1',
        code: 'TEST-001',
        name: 'สินค้าทดสอบ',
      };
      mockDatabase.findInventoryById.mockResolvedValue(mockItem);

      const request = new NextRequest('http://localhost:3000/api/inventory/1');
      const response = await getById(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockItem);
      expect(mockDatabase.findInventoryById).toHaveBeenCalledWith('1');
    });

    it('should return 404 for non-existent item', async () => {
      mockVerifyAuth.mockResolvedValue({
        success: true,
        user: { id: '1', role: 'user' },
      });

      mockDatabase.findInventoryById.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/inventory/999');
      const response = await getById(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PATCH /api/inventory/[id]', () => {
    it('should update inventory item for admin user', async () => {
      mockVerifyAuth.mockResolvedValue({
        success: true,
        user: { id: '1', role: 'admin' },
      });

      const existingItem = {
        id: '1',
        code: 'TEST-001',
        name: 'สินค้าเดิม',
      };
      const updates = { name: 'สินค้าใหม่', currentStock: 200 };
      const updatedItem = { ...existingItem, ...updates };

      mockDatabase.findInventoryById.mockResolvedValue(existingItem);
      mockDatabase.updateInventoryItem.mockResolvedValue(updatedItem);

      const request = new NextRequest('http://localhost:3000/api/inventory/1', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      const response = await PATCH(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(updatedItem);
      expect(mockDatabase.updateInventoryItem).toHaveBeenCalledWith('1', updates);
    });

    it('should return 403 for non-admin user', async () => {
      mockVerifyAuth.mockResolvedValue({
        success: true,
        user: { id: '1', role: 'user' },
      });

      const request = new NextRequest('http://localhost:3000/api/inventory/1', {
        method: 'PATCH',
        body: JSON.stringify({}),
      });
      const response = await PATCH(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });
  });

  describe('DELETE /api/inventory/[id]', () => {
    it('should delete inventory item for admin user', async () => {
      mockVerifyAuth.mockResolvedValue({
        success: true,
        user: { id: '1', role: 'admin' },
      });

      mockDatabase.deleteInventoryItem.mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/inventory/1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockDatabase.deleteInventoryItem).toHaveBeenCalledWith('1');
    });

    it('should return 404 for non-existent item', async () => {
      mockVerifyAuth.mockResolvedValue({
        success: true,
        user: { id: '1', role: 'admin' },
      });

      mockDatabase.deleteInventoryItem.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/inventory/999', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });
});