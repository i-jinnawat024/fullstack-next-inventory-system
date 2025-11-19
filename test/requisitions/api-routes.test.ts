import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/requisitions/route';
import { GET as getById, PATCH, DELETE } from '@/app/api/requisitions/[id]/route';

// Mock the JWT verification
vi.mock('@/lib/auth/jwt', () => ({
  verifyToken: vi.fn(),
}));

// Mock the database
vi.mock('@/lib/database/mock-database', () => ({
  mockDb: {
    findAllRequisitions: vi.fn(),
    findRequisitionById: vi.fn(),
    createRequisition: vi.fn(),
    updateRequisition: vi.fn(),
    deleteRequisition: vi.fn(),
    validateStockAvailability: vi.fn(),
  },
}));

import { verifyToken } from '@/lib/auth/jwt';
import { mockDb } from '@/lib/database/mock-database';

const mockVerifyToken = verifyToken as any;
const mockDatabase = mockDb as any;

describe('Requisition API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/requisitions', () => {
    it('should return user requisitions for authenticated user', async () => {
      // Mock successful authentication
      mockVerifyToken.mockReturnValue({
        userId: '2',
        email: 'user@company.com',
        role: 'user',
        iat: 1234567890,
        exp: 9999999999,
      });

      // Mock database response
      const mockRequisitions = [
        {
          id: '1',
          documentNumber: 'REQ-2024-001',
          userId: '2',
          status: 'pending',
          items: [{ inventoryItemId: '1', quantity: 5 }],
          notes: 'สำหรับงานประจำเดือน',
          createdAt: '2024-12-01T00:00:00.000Z',
          updatedAt: '2024-12-01T00:00:00.000Z',
        },
      ];
      mockDatabase.findAllRequisitions.mockResolvedValue(mockRequisitions);

      const request = new NextRequest('http://localhost:3000/api/requisitions', {
        headers: {
          cookie: 'auth-token=valid-token',
        },
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockRequisitions);
      expect(mockDatabase.findAllRequisitions).toHaveBeenCalledWith({
        userId: '2',
        status: undefined,
      });
    });

    it('should return all requisitions for admin user', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '1',
        email: 'admin@company.com',
        role: 'admin',
        iat: 1234567890,
        exp: 9999999999,
      });

      mockDatabase.findAllRequisitions.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/requisitions', {
        headers: {
          cookie: 'auth-token=valid-token',
        },
      });
      await GET(request);

      expect(mockDatabase.findAllRequisitions).toHaveBeenCalledWith({
        status: undefined,
      });
    });

    it('should apply status filter', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '2',
        role: 'user',
        iat: 1234567890,
        exp: 9999999999,
      });
      mockDatabase.findAllRequisitions.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/requisitions?status=pending', {
        headers: {
          cookie: 'auth-token=valid-token',
        },
      });
      await GET(request);

      expect(mockDatabase.findAllRequisitions).toHaveBeenCalledWith({
        userId: '2',
        status: 'pending',
      });
    });

    it('should return 401 for missing token', async () => {
      const request = new NextRequest('http://localhost:3000/api/requisitions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 for invalid token', async () => {
      mockVerifyToken.mockReturnValue(null);

      const request = new NextRequest('http://localhost:3000/api/requisitions', {
        headers: {
          cookie: 'auth-token=invalid-token',
        },
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_TOKEN');
    });
  });

  describe('POST /api/requisitions', () => {
    it('should create requisition with valid data', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '2',
        email: 'user@company.com',
        role: 'user',
        iat: 1234567890,
        exp: 9999999999,
      });

      const requisitionData = {
        items: [
          { inventoryItemId: '1', quantity: 5 },
          { inventoryItemId: '2', quantity: 3 },
        ],
        notes: 'สำหรับงานประจำเดือน',
      };

      const createdRequisition = {
        id: '10',
        documentNumber: 'REQ-2024-010',
        userId: '2',
        status: 'pending',
        items: requisitionData.items,
        notes: requisitionData.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDatabase.validateStockAvailability.mockResolvedValue({
        valid: true,
        errors: [],
      });
      mockDatabase.createRequisition.mockResolvedValue(createdRequisition);

      const request = new NextRequest('http://localhost:3000/api/requisitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify(requisitionData),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(createdRequisition.id);
      expect(data.data.documentNumber).toBe(createdRequisition.documentNumber);
      expect(mockDatabase.validateStockAvailability).toHaveBeenCalledWith(requisitionData.items);
      expect(mockDatabase.createRequisition).toHaveBeenCalledWith({
        userId: '2',
        status: 'pending',
        items: requisitionData.items,
        notes: requisitionData.notes,
      });
    });

    it('should return 400 for empty items array', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '2',
        role: 'user',
        iat: 1234567890,
        exp: 9999999999,
      });

      const request = new NextRequest('http://localhost:3000/api/requisitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ items: [] }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_DATA');
      expect(data.error.message).toBe('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ');
    });

    it('should return 400 for invalid item data', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '2',
        role: 'user',
        iat: 1234567890,
        exp: 9999999999,
      });

      const request = new NextRequest('http://localhost:3000/api/requisitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({
          items: [{ inventoryItemId: '1', quantity: 0 }], // Invalid quantity
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_DATA');
    });

    it('should return 400 for insufficient stock', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '2',
        role: 'user',
        iat: 1234567890,
        exp: 9999999999,
      });

      const requisitionData = {
        items: [{ inventoryItemId: '1', quantity: 1000 }], // Too much quantity
      };

      mockDatabase.validateStockAvailability.mockResolvedValue({
        valid: false,
        errors: ['ปากกาลูกลื่น สีน้ำเงิน มีสต็อกไม่เพียงพอ (คงเหลือ 150 ด้าม)'],
      });

      const request = new NextRequest('http://localhost:3000/api/requisitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify(requisitionData),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INSUFFICIENT_STOCK');
      expect(data.error.details).toEqual(['ปากกาลูกลื่น สีน้ำเงิน มีสต็อกไม่เพียงพอ (คงเหลือ 150 ด้าม)']);
    });
  });

  describe('GET /api/requisitions/[id]', () => {
    it('should return requisition for owner', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '2',
        role: 'user',
        iat: 1234567890,
        exp: 9999999999,
      });

      const mockRequisition = {
        id: '1',
        documentNumber: 'REQ-2024-001',
        userId: '2',
        status: 'pending',
        items: [{ inventoryItemId: '1', quantity: 5 }],
        createdAt: '2025-11-16T08:29:27.808Z',
        updatedAt: '2025-11-16T08:29:27.808Z',
      };
      mockDatabase.findRequisitionById.mockResolvedValue(mockRequisition);

      const request = new NextRequest('http://localhost:3000/api/requisitions/1', {
        headers: {
          cookie: 'auth-token=valid-token',
        },
      });
      const response = await getById(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockRequisition);
    });

    it('should return requisition for admin', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '1',
        role: 'admin',
        iat: 1234567890,
        exp: 9999999999,
      });

      const mockRequisition = {
        id: '1',
        userId: '2', // Different user
        status: 'pending',
      };
      mockDatabase.findRequisitionById.mockResolvedValue(mockRequisition);

      const request = new NextRequest('http://localhost:3000/api/requisitions/1', {
        headers: {
          cookie: 'auth-token=valid-token',
        },
      });
      const response = await getById(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 403 for non-owner user', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '3',
        role: 'user',
        iat: 1234567890,
        exp: 9999999999,
      });

      const mockRequisition = {
        id: '1',
        userId: '2', // Different user
        status: 'pending',
      };
      mockDatabase.findRequisitionById.mockResolvedValue(mockRequisition);

      const request = new NextRequest('http://localhost:3000/api/requisitions/1', {
        headers: {
          cookie: 'auth-token=valid-token',
        },
      });
      const response = await getById(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('should return 404 for non-existent requisition', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '2',
        role: 'user',
        iat: 1234567890,
        exp: 9999999999,
      });

      mockDatabase.findRequisitionById.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/requisitions/999', {
        headers: {
          cookie: 'auth-token=valid-token',
        },
      });
      const response = await getById(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PATCH /api/requisitions/[id]', () => {
    it('should update draft requisition', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '2',
        role: 'user',
        iat: 1234567890,
        exp: 9999999999,
      });

      const existingRequisition = {
        id: '1',
        userId: '2',
        status: 'draft',
        items: [{ inventoryItemId: '1', quantity: 5 }],
        notes: 'เก่า',
      };

      const updates = {
        items: [{ inventoryItemId: '1', quantity: 10 }],
        notes: 'ใหม่',
      };

      const updatedRequisition = { ...existingRequisition, ...updates };

      mockDatabase.findRequisitionById.mockResolvedValue(existingRequisition);
      mockDatabase.validateStockAvailability.mockResolvedValue({
        valid: true,
        errors: [],
      });
      mockDatabase.updateRequisition.mockResolvedValue(updatedRequisition);

      const request = new NextRequest('http://localhost:3000/api/requisitions/1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify(updates),
      });
      const response = await PATCH(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(updatedRequisition);
      expect(mockDatabase.updateRequisition).toHaveBeenCalledWith('1', {
        items: updates.items,
        notes: updates.notes,
      });
    });

    it('should return 400 for non-draft requisition', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '2',
        role: 'user',
        iat: 1234567890,
        exp: 9999999999,
      });

      const existingRequisition = {
        id: '1',
        userId: '2',
        status: 'pending', // Not draft
      };

      mockDatabase.findRequisitionById.mockResolvedValue(existingRequisition);

      const request = new NextRequest('http://localhost:3000/api/requisitions/1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ notes: 'ใหม่' }),
      });
      const response = await PATCH(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_STATUS');
    });

    it('should return 403 for non-owner', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '3',
        role: 'user',
        iat: 1234567890,
        exp: 9999999999,
      });

      const existingRequisition = {
        id: '1',
        userId: '2', // Different user
        status: 'draft',
      };

      mockDatabase.findRequisitionById.mockResolvedValue(existingRequisition);

      const request = new NextRequest('http://localhost:3000/api/requisitions/1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ notes: 'ใหม่' }),
      });
      const response = await PATCH(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });
  });

  describe('DELETE /api/requisitions/[id]', () => {
    it('should delete draft requisition', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '2',
        role: 'user',
        iat: 1234567890,
        exp: 9999999999,
      });

      const existingRequisition = {
        id: '1',
        userId: '2',
        status: 'draft',
      };

      mockDatabase.findRequisitionById.mockResolvedValue(existingRequisition);
      mockDatabase.deleteRequisition.mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/requisitions/1', {
        method: 'DELETE',
        headers: {
          cookie: 'auth-token=valid-token',
        },
      });
      const response = await DELETE(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockDatabase.deleteRequisition).toHaveBeenCalledWith('1');
    });

    it('should return 400 for non-draft requisition', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '2',
        role: 'user',
        iat: 1234567890,
        exp: 9999999999,
      });

      const existingRequisition = {
        id: '1',
        userId: '2',
        status: 'pending', // Not draft
      };

      mockDatabase.findRequisitionById.mockResolvedValue(existingRequisition);

      const request = new NextRequest('http://localhost:3000/api/requisitions/1', {
        method: 'DELETE',
        headers: {
          cookie: 'auth-token=valid-token',
        },
      });
      const response = await DELETE(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_STATUS');
    });
  });
});