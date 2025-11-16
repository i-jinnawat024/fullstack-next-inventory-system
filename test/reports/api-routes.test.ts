import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/reports/route';

// Mock the auth verification
vi.mock('@/lib/auth/jwt', () => ({
  verifyAuth: vi.fn(),
}));

// Mock the database
vi.mock('@/lib/database/mock-database', () => ({
  mockDb: {
    findAllRequisitions: vi.fn(),
    findAllInventory: vi.fn(),
    findAllUsers: vi.fn(),
  },
}));

import { verifyAuth } from '@/lib/auth/jwt';
import { mockDb } from '@/lib/database/mock-database';

const mockVerifyAuth = verifyAuth as any;
const mockDatabase = mockDb as any;

describe('Reports API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/reports', () => {
    it('should generate report with all requisitions', async () => {
      mockVerifyAuth.mockResolvedValue({
        valid: true,
        user: { id: '1', role: 'admin' },
      });

      const mockRequisitions = [
        {
          id: '1',
          userId: '2',
          status: 'approved',
          items: [{ inventoryItemId: '1', quantity: 5 }],
          createdAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          userId: '2',
          status: 'rejected',
          items: [{ inventoryItemId: '2', quantity: 3 }],
          createdAt: new Date('2024-01-02'),
        },
        {
          id: '3',
          userId: '3',
          status: 'pending',
          items: [{ inventoryItemId: '1', quantity: 2 }],
          createdAt: new Date('2024-01-03'),
        },
      ];

      const mockInventory = [
        { id: '1', name: 'สินค้า 1' },
        { id: '2', name: 'สินค้า 2' },
      ];

      const mockUsers = [
        { id: '2', name: 'ผู้ใช้ 1' },
        { id: '3', name: 'ผู้ใช้ 2' },
      ];

      mockDatabase.findAllRequisitions.mockResolvedValue(mockRequisitions);
      mockDatabase.findAllInventory.mockResolvedValue(mockInventory);
      mockDatabase.findAllUsers.mockResolvedValue(mockUsers);

      const request = new NextRequest('http://localhost:3000/api/reports');
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.totalRequisitions).toBe(3);
      expect(result.data.approvedRequisitions).toBe(1);
      expect(result.data.rejectedRequisitions).toBe(1);
      expect(result.data.pendingRequisitions).toBe(1);
    });

    it('should calculate most requested items correctly', async () => {
      mockVerifyAuth.mockResolvedValue({
        valid: true,
        user: { id: '1', role: 'admin' },
      });

      const mockRequisitions = [
        {
          id: '1',
          userId: '2',
          status: 'approved',
          items: [
            { inventoryItemId: '1', quantity: 5 },
            { inventoryItemId: '2', quantity: 3 },
          ],
          createdAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          userId: '3',
          status: 'approved',
          items: [{ inventoryItemId: '1', quantity: 10 }],
          createdAt: new Date('2024-01-02'),
        },
      ];

      const mockInventory = [
        { id: '1', name: 'สินค้า 1' },
        { id: '2', name: 'สินค้า 2' },
      ];

      mockDatabase.findAllRequisitions.mockResolvedValue(mockRequisitions);
      mockDatabase.findAllInventory.mockResolvedValue(mockInventory);
      mockDatabase.findAllUsers.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/reports');
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.mostRequestedItems).toHaveLength(2);
      expect(result.data.mostRequestedItems[0].itemId).toBe('1');
      expect(result.data.mostRequestedItems[0].totalRequested).toBe(15);
      expect(result.data.mostRequestedItems[1].itemId).toBe('2');
      expect(result.data.mostRequestedItems[1].totalRequested).toBe(3);
    });

    it('should calculate user activity correctly', async () => {
      mockVerifyAuth.mockResolvedValue({
        valid: true,
        user: { id: '1', role: 'admin' },
      });

      const mockRequisitions = [
        {
          id: '1',
          userId: '2',
          status: 'approved',
          items: [],
          createdAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          userId: '2',
          status: 'pending',
          items: [],
          createdAt: new Date('2024-01-02'),
        },
        {
          id: '3',
          userId: '3',
          status: 'approved',
          items: [],
          createdAt: new Date('2024-01-03'),
        },
      ];

      const mockUsers = [
        { id: '2', name: 'ผู้ใช้ 1' },
        { id: '3', name: 'ผู้ใช้ 2' },
      ];

      mockDatabase.findAllRequisitions.mockResolvedValue(mockRequisitions);
      mockDatabase.findAllInventory.mockResolvedValue([]);
      mockDatabase.findAllUsers.mockResolvedValue(mockUsers);

      const request = new NextRequest('http://localhost:3000/api/reports');
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.userActivity).toHaveLength(2);
      expect(result.data.userActivity[0].userId).toBe('2');
      expect(result.data.userActivity[0].totalRequisitions).toBe(2);
      expect(result.data.userActivity[1].userId).toBe('3');
      expect(result.data.userActivity[1].totalRequisitions).toBe(1);
    });

    it('should filter by userId', async () => {
      mockVerifyAuth.mockResolvedValue({
        valid: true,
        user: { id: '1', role: 'admin' },
      });

      const mockRequisitions = [
        {
          id: '1',
          userId: '2',
          status: 'approved',
          items: [],
          createdAt: new Date('2024-01-01'),
        },
      ];

      mockDatabase.findAllRequisitions.mockResolvedValue(mockRequisitions);
      mockDatabase.findAllInventory.mockResolvedValue([]);
      mockDatabase.findAllUsers.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/reports?userId=2');
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.totalRequisitions).toBe(1);
    });

    it('should filter by productId', async () => {
      mockVerifyAuth.mockResolvedValue({
        valid: true,
        user: { id: '1', role: 'admin' },
      });

      const mockRequisitions = [
        {
          id: '1',
          userId: '2',
          status: 'approved',
          items: [{ inventoryItemId: '1', quantity: 5 }],
          createdAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          userId: '3',
          status: 'approved',
          items: [{ inventoryItemId: '2', quantity: 3 }],
          createdAt: new Date('2024-01-02'),
        },
      ];

      mockDatabase.findAllRequisitions.mockResolvedValue(mockRequisitions);
      mockDatabase.findAllInventory.mockResolvedValue([]);
      mockDatabase.findAllUsers.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/reports?productId=1');
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.totalRequisitions).toBe(1);
    });

    it('should filter by date range', async () => {
      mockVerifyAuth.mockResolvedValue({
        valid: true,
        user: { id: '1', role: 'admin' },
      });

      const mockRequisitions = [
        {
          id: '1',
          userId: '2',
          status: 'approved',
          items: [],
          createdAt: new Date('2024-01-15'),
        },
        {
          id: '2',
          userId: '3',
          status: 'approved',
          items: [],
          createdAt: new Date('2024-02-15'),
        },
      ];

      mockDatabase.findAllRequisitions.mockResolvedValue(mockRequisitions);
      mockDatabase.findAllInventory.mockResolvedValue([]);
      mockDatabase.findAllUsers.mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/reports?dateFrom=2024-01-01&dateTo=2024-01-31'
      );
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.totalRequisitions).toBe(1);
    });

    it('should exclude draft requisitions from statistics', async () => {
      mockVerifyAuth.mockResolvedValue({
        valid: true,
        user: { id: '1', role: 'admin' },
      });

      const mockRequisitions = [
        {
          id: '1',
          userId: '2',
          status: 'draft',
          items: [{ inventoryItemId: '1', quantity: 100 }],
          createdAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          userId: '2',
          status: 'approved',
          items: [{ inventoryItemId: '1', quantity: 5 }],
          createdAt: new Date('2024-01-02'),
        },
      ];

      const mockInventory = [{ id: '1', name: 'สินค้า 1' }];

      mockDatabase.findAllRequisitions.mockResolvedValue(mockRequisitions);
      mockDatabase.findAllInventory.mockResolvedValue(mockInventory);
      mockDatabase.findAllUsers.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/reports');
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.mostRequestedItems[0].totalRequested).toBe(5);
    });

    it('should return 403 for non-admin user', async () => {
      mockVerifyAuth.mockResolvedValue({
        valid: true,
        user: { id: '1', role: 'user' },
      });

      const request = new NextRequest('http://localhost:3000/api/reports');
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 for unauthenticated request', async () => {
      mockVerifyAuth.mockResolvedValue({
        valid: false,
        error: 'Invalid token',
      });

      const request = new NextRequest('http://localhost:3000/api/reports');
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.success).toBe(false);
    });
  });
});
