import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as approveRequisition } from '@/app/api/requisitions/[id]/approve/route';
import { POST as rejectRequisition } from '@/app/api/requisitions/[id]/reject/route';
import { POST as issueRequisition } from '@/app/api/requisitions/[id]/issue/route';

// Mock the JWT verification
vi.mock('@/lib/auth/jwt', () => ({
  verifyToken: vi.fn(),
}));

// Mock the database
vi.mock('@/lib/database/mock-database', () => ({
  mockDb: {
    findRequisitionById: vi.fn(),
    validateStockAvailability: vi.fn(),
    reduceStock: vi.fn(),
    updateRequisitionWithAudit: vi.fn(),
  },
}));

import { verifyToken } from '@/lib/auth/jwt';
import { mockDb } from '@/lib/database/mock-database';

const mockVerifyToken = verifyToken as any;
const mockDatabase = mockDb as any;

describe('Approval System API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/requisitions/[id]/approve', () => {
    it('should approve pending requisition with stock reduction', async () => {
      // Mock admin authentication
      mockVerifyToken.mockReturnValue({
        userId: '1',
        email: 'admin@company.com',
        role: 'admin',
        iat: 1234567890,
        exp: 9999999999,
      });

      const mockRequisition = {
        id: '1',
        documentNumber: 'REQ-2024-001',
        userId: '2',
        status: 'pending',
        items: [
          { inventoryItemId: '1', quantity: 5 },
          { inventoryItemId: '3', quantity: 2 }
        ],
        notes: 'สำหรับงานประจำเดือน',
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-01'),
      };

      const approvedRequisition = {
        ...mockRequisition,
        status: 'approved',
        approvedBy: '1',
        approvedAt: new Date(),
      };

      mockDatabase.findRequisitionById.mockResolvedValue(mockRequisition);
      mockDatabase.validateStockAvailability.mockResolvedValue({
        valid: true,
        errors: [],
      });
      mockDatabase.reduceStock.mockResolvedValue(true);
      mockDatabase.updateRequisitionWithAudit.mockResolvedValue(approvedRequisition);

      const request = new NextRequest('http://localhost:3000/api/requisitions/1/approve', {
        method: 'POST',
        headers: {
          cookie: 'auth-token=valid-token',
        },
      });
      const response = await approveRequisition(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('approved');
      expect(mockDatabase.validateStockAvailability).toHaveBeenCalledWith(mockRequisition.items);
      expect(mockDatabase.reduceStock).toHaveBeenCalledWith(mockRequisition.items);
      expect(mockDatabase.updateRequisitionWithAudit).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          status: 'approved',
          approvedBy: '1',
        }),
        '1',
        'approve'
      );
    });

    it('should return 401 for missing token', async () => {
      const request = new NextRequest('http://localhost:3000/api/requisitions/1/approve', {
        method: 'POST',
      });
      const response = await approveRequisition(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 for non-admin user', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '2',
        role: 'user',
        iat: 1234567890,
        exp: 9999999999,
      });

      const request = new NextRequest('http://localhost:3000/api/requisitions/1/approve', {
        method: 'POST',
        headers: {
          cookie: 'auth-token=valid-token',
        },
      });
      const response = await approveRequisition(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('should return 404 for non-existent requisition', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '1',
        role: 'admin',
        iat: 1234567890,
        exp: 9999999999,
      });

      mockDatabase.findRequisitionById.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/requisitions/999/approve', {
        method: 'POST',
        headers: {
          cookie: 'auth-token=valid-token',
        },
      });
      const response = await approveRequisition(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for non-pending requisition', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '1',
        role: 'admin',
        iat: 1234567890,
        exp: 9999999999,
      });

      const mockRequisition = {
        id: '1',
        status: 'approved', // Already approved
        items: [],
      };

      mockDatabase.findRequisitionById.mockResolvedValue(mockRequisition);

      const request = new NextRequest('http://localhost:3000/api/requisitions/1/approve', {
        method: 'POST',
        headers: {
          cookie: 'auth-token=valid-token',
        },
      });
      const response = await approveRequisition(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_STATUS');
    });

    it('should return 400 for insufficient stock', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '1',
        role: 'admin',
        iat: 1234567890,
        exp: 9999999999,
      });

      const mockRequisition = {
        id: '1',
        status: 'pending',
        items: [{ inventoryItemId: '1', quantity: 1000 }],
      };

      mockDatabase.findRequisitionById.mockResolvedValue(mockRequisition);
      mockDatabase.validateStockAvailability.mockResolvedValue({
        valid: false,
        errors: ['ปากกาลูกลื่น สีน้ำเงิน มีสต็อกไม่เพียงพอ (คงเหลือ 150 ด้าม)'],
      });

      const request = new NextRequest('http://localhost:3000/api/requisitions/1/approve', {
        method: 'POST',
        headers: {
          cookie: 'auth-token=valid-token',
        },
      });
      const response = await approveRequisition(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INSUFFICIENT_STOCK');
      expect(data.error.details).toEqual(['ปากกาลูกลื่น สีน้ำเงิน มีสต็อกไม่เพียงพอ (คงเหลือ 150 ด้าม)']);
    });
  });

  describe('POST /api/requisitions/[id]/reject', () => {
    it('should reject pending requisition with comment', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '1',
        role: 'admin',
        iat: 1234567890,
        exp: 9999999999,
      });

      const mockRequisition = {
        id: '1',
        documentNumber: 'REQ-2024-001',
        userId: '2',
        status: 'pending',
        items: [{ inventoryItemId: '1', quantity: 5 }],
      };

      const rejectedRequisition = {
        ...mockRequisition,
        status: 'rejected',
        rejectionReason: 'สินค้าไม่เพียงพอสำหรับการอนุมัติ',
        approvedBy: '1',
        approvedAt: new Date(),
      };

      mockDatabase.findRequisitionById.mockResolvedValue(mockRequisition);
      mockDatabase.updateRequisitionWithAudit.mockResolvedValue(rejectedRequisition);

      const request = new NextRequest('http://localhost:3000/api/requisitions/1/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ reason: 'สินค้าไม่เพียงพอสำหรับการอนุมัติ' }),
      });
      const response = await rejectRequisition(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('rejected');
      expect(data.data.rejectionReason).toBe('สินค้าไม่เพียงพอสำหรับการอนุมัติ');
      expect(mockDatabase.updateRequisitionWithAudit).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          status: 'rejected',
          rejectionReason: 'สินค้าไม่เพียงพอสำหรับการอนุมัติ',
          approvedBy: '1',
        }),
        '1',
        'reject'
      );
    });

    it('should return 400 for missing rejection reason', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '1',
        role: 'admin',
        iat: 1234567890,
        exp: 9999999999,
      });

      const mockRequisition = {
        id: '1',
        status: 'pending',
        items: [],
      };

      mockDatabase.findRequisitionById.mockResolvedValue(mockRequisition);

      const request = new NextRequest('http://localhost:3000/api/requisitions/1/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ reason: '' }),
      });
      const response = await rejectRequisition(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_DATA');
    });

    it('should return 403 for non-admin user', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '2',
        role: 'user',
        iat: 1234567890,
        exp: 9999999999,
      });

      const request = new NextRequest('http://localhost:3000/api/requisitions/1/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ reason: 'test' }),
      });
      const response = await rejectRequisition(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('should return 400 for non-pending requisition', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '1',
        role: 'admin',
        iat: 1234567890,
        exp: 9999999999,
      });

      const mockRequisition = {
        id: '1',
        status: 'approved',
        items: [],
      };

      mockDatabase.findRequisitionById.mockResolvedValue(mockRequisition);

      const request = new NextRequest('http://localhost:3000/api/requisitions/1/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ reason: 'test reason' }),
      });
      const response = await rejectRequisition(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_STATUS');
    });
  });

  describe('POST /api/requisitions/[id]/issue', () => {
    it('should mark approved requisition as issued', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '1',
        role: 'admin',
        iat: 1234567890,
        exp: 9999999999,
      });

      const mockRequisition = {
        id: '1',
        documentNumber: 'REQ-2024-001',
        userId: '2',
        status: 'approved',
        items: [{ inventoryItemId: '1', quantity: 5 }],
        approvedBy: '1',
        approvedAt: new Date('2024-12-02'),
      };

      const issuedRequisition = {
        ...mockRequisition,
        status: 'issued',
        issuedAt: new Date(),
      };

      mockDatabase.findRequisitionById.mockResolvedValue(mockRequisition);
      mockDatabase.updateRequisitionWithAudit.mockResolvedValue(issuedRequisition);

      const request = new NextRequest('http://localhost:3000/api/requisitions/1/issue', {
        method: 'POST',
        headers: {
          cookie: 'auth-token=valid-token',
        },
      });
      const response = await issueRequisition(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('issued');
      expect(mockDatabase.updateRequisitionWithAudit).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          status: 'issued',
        }),
        '1',
        'issue'
      );
    });

    it('should return 403 for non-admin user', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '2',
        role: 'user',
        iat: 1234567890,
        exp: 9999999999,
      });

      const request = new NextRequest('http://localhost:3000/api/requisitions/1/issue', {
        method: 'POST',
        headers: {
          cookie: 'auth-token=valid-token',
        },
      });
      const response = await issueRequisition(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('should return 400 for non-approved requisition', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '1',
        role: 'admin',
        iat: 1234567890,
        exp: 9999999999,
      });

      const mockRequisition = {
        id: '1',
        status: 'pending', // Not approved yet
        items: [],
      };

      mockDatabase.findRequisitionById.mockResolvedValue(mockRequisition);

      const request = new NextRequest('http://localhost:3000/api/requisitions/1/issue', {
        method: 'POST',
        headers: {
          cookie: 'auth-token=valid-token',
        },
      });
      const response = await issueRequisition(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_STATUS');
    });

    it('should return 404 for non-existent requisition', async () => {
      mockVerifyToken.mockReturnValue({
        userId: '1',
        role: 'admin',
        iat: 1234567890,
        exp: 9999999999,
      });

      mockDatabase.findRequisitionById.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/requisitions/999/issue', {
        method: 'POST',
        headers: {
          cookie: 'auth-token=valid-token',
        },
      });
      const response = await issueRequisition(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });
});
