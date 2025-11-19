import { describe, it, expect, beforeEach } from 'vitest';
import { MockDatabase } from '@/lib/database/mock-database';
import { Requisition, RequisitionItem } from '@/lib/types';

describe('MockDatabase Requisition Operations', () => {
  let db: MockDatabase;

  beforeEach(() => {
    // Create a fresh instance for each test
    db = new (MockDatabase as any)();
  });

  describe('createRequisition', () => {
    it('should create requisition with auto-generated document number', async () => {
      const requisitionData = {
        userId: '2',
        status: 'pending' as const,
        items: [
          { inventoryItemId: '1', quantity: 5 },
          { inventoryItemId: '2', quantity: 3 },
        ],
        notes: 'สำหรับงานประจำเดือน',
      };

      const result = await db.createRequisition(requisitionData);

      expect(result.id).toBeDefined();
      expect(result.documentNumber).toMatch(/^REQ-\d{4}-\d{3}$/);
      expect(result.userId).toBe(requisitionData.userId);
      expect(result.status).toBe(requisitionData.status);
      expect(result.items).toEqual(requisitionData.items);
      expect(result.notes).toBe(requisitionData.notes);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should generate sequential document numbers', async () => {
      const requisitionData1 = {
        userId: '2',
        status: 'pending' as const,
        items: [{ inventoryItemId: '1', quantity: 5 }],
        notes: '',
      };

      const requisitionData2 = {
        userId: '3',
        status: 'draft' as const,
        items: [{ inventoryItemId: '2', quantity: 3 }],
        notes: '',
      };

      const result1 = await db.createRequisition(requisitionData1);
      const result2 = await db.createRequisition(requisitionData2);

      const year = new Date().getFullYear();
      // Since we create a fresh DB instance for each test, it starts with seeded data (3 items from 2024)
      // New items for current year start from 001
      expect(result1.documentNumber).toBe(`REQ-${year}-001`);
      expect(result2.documentNumber).toBe(`REQ-${year}-002`);
    });
  });

  describe('findAllRequisitions', () => {
    it('should return all requisitions without filter', async () => {
      const result = await db.findAllRequisitions();

      expect(result).toHaveLength(3); // From seeded data
      expect(result[0].documentNumber).toBe('REQ-2024-003'); // Most recent first
      expect(result[1].documentNumber).toBe('REQ-2024-002');
      expect(result[2].documentNumber).toBe('REQ-2024-001');
    });

    it('should filter by userId', async () => {
      const result = await db.findAllRequisitions({ userId: '2' });

      expect(result).toHaveLength(2); // User 2 has 2 requisitions
      expect(result.every(req => req.userId === '2')).toBe(true);
    });

    it('should filter by status', async () => {
      const result = await db.findAllRequisitions({ status: 'pending' });

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('pending');
    });

    it('should filter by both userId and status', async () => {
      const result = await db.findAllRequisitions({ userId: '2', status: 'draft' });

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('2');
      expect(result[0].status).toBe('draft');
    });
  });

  describe('findRequisitionById', () => {
    it('should return requisition by id', async () => {
      const result = await db.findRequisitionById('1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
      expect(result?.documentNumber).toBe('REQ-2024-001');
    });

    it('should return null for non-existent id', async () => {
      const result = await db.findRequisitionById('999');

      expect(result).toBeNull();
    });
  });

  describe('updateRequisition', () => {
    it('should update requisition fields', async () => {
      const updates = {
        items: [{ inventoryItemId: '5', quantity: 10 }],
        notes: 'อัปเดตแล้ว',
      };

      const result = await db.updateRequisition('3', updates);

      expect(result).toBeDefined();
      expect(result?.items).toEqual(updates.items);
      expect(result?.notes).toBe(updates.notes);
      expect(result?.updatedAt).toBeInstanceOf(Date);
    });

    it('should return null for non-existent requisition', async () => {
      const result = await db.updateRequisition('999', { notes: 'test' });

      expect(result).toBeNull();
    });
  });

  describe('deleteRequisition', () => {
    it('should delete requisition', async () => {
      const result = await db.deleteRequisition('3');

      expect(result).toBe(true);

      // Verify it's deleted
      const deleted = await db.findRequisitionById('3');
      expect(deleted).toBeNull();
    });

    it('should return false for non-existent requisition', async () => {
      const result = await db.deleteRequisition('999');

      expect(result).toBe(false);
    });
  });

  describe('validateStockAvailability', () => {
    it('should validate sufficient stock', async () => {
      const items: RequisitionItem[] = [
        { inventoryItemId: '1', quantity: 5 }, // Pen has 150 stock
        { inventoryItemId: '2', quantity: 10 }, // Pen has 200 stock
      ];

      const result = await db.validateStockAvailability(items);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect insufficient stock', async () => {
      const items: RequisitionItem[] = [
        { inventoryItemId: '1', quantity: 1000 }, // Exceeds 150 stock
        { inventoryItemId: '2', quantity: 5 }, // Within 200 stock
      ];

      const result = await db.validateStockAvailability(items);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('ปากกาลูกลื่น สีน้ำเงิน');
      expect(result.errors[0]).toContain('สต็อกไม่เพียงพอ');
    });

    it('should detect non-existent inventory item', async () => {
      const items: RequisitionItem[] = [
        { inventoryItemId: '999', quantity: 1 }, // Non-existent item
      ];

      const result = await db.validateStockAvailability(items);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('ไม่พบสินค้ารหัส 999');
    });

    it('should detect multiple stock issues', async () => {
      const items: RequisitionItem[] = [
        { inventoryItemId: '1', quantity: 1000 }, // Exceeds stock
        { inventoryItemId: '8', quantity: 1 }, // Out of stock (0 remaining)
        { inventoryItemId: '999', quantity: 1 }, // Non-existent
      ];

      const result = await db.validateStockAvailability(items);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(3);
    });
  });

  describe('reduceStock', () => {
    it('should reduce stock for valid items', async () => {
      const items: RequisitionItem[] = [
        { inventoryItemId: '1', quantity: 5 }, // Reduce from 150 to 145
        { inventoryItemId: '2', quantity: 10 }, // Reduce from 200 to 190
      ];

      const result = await db.reduceStock(items);

      expect(result).toBe(true);

      // Verify stock was reduced
      const item1 = await db.findInventoryById('1');
      const item2 = await db.findInventoryById('2');
      expect(item1?.currentStock).toBe(145);
      expect(item2?.currentStock).toBe(190);
    });

    it('should fail for insufficient stock', async () => {
      const items: RequisitionItem[] = [
        { inventoryItemId: '1', quantity: 1000 }, // Exceeds available stock
      ];

      const result = await db.reduceStock(items);

      expect(result).toBe(false);

      // Verify stock was not changed
      const item1 = await db.findInventoryById('1');
      expect(item1?.currentStock).toBe(150); // Original stock
    });

    it('should fail for non-existent item', async () => {
      const items: RequisitionItem[] = [
        { inventoryItemId: '999', quantity: 1 }, // Non-existent item
      ];

      const result = await db.reduceStock(items);

      expect(result).toBe(false);
    });

    it('should be atomic - fail all if any item fails', async () => {
      const items: RequisitionItem[] = [
        { inventoryItemId: '1', quantity: 5 }, // Valid
        { inventoryItemId: '2', quantity: 1000 }, // Invalid - exceeds stock
      ];

      const result = await db.reduceStock(items);

      expect(result).toBe(false);

      // Verify no stock was reduced for any item
      const item1 = await db.findInventoryById('1');
      const item2 = await db.findInventoryById('2');
      expect(item1?.currentStock).toBe(150); // Original stock
      expect(item2?.currentStock).toBe(200); // Original stock
    });
  });
});