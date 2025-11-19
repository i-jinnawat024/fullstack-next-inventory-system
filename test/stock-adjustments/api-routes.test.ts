import { describe, it, expect, beforeEach } from 'vitest';
import { mockDb } from '@/lib/database/mock-database';

describe('Stock Adjustments API', () => {
  beforeEach(async () => {
    // Reset database state before each test
    const db = mockDb as any;
    db.stockAdjustments = [];
  });

  describe('Stock Adjustment Creation', () => {
    it('should create stock adjustment and increase inventory', async () => {
      // Get initial inventory item
      const item = await mockDb.findInventoryById('1');
      expect(item).toBeTruthy();
      const initialStock = item!.currentStock;

      // Create stock adjustment (in)
      const adjustment = await mockDb.createStockAdjustment({
        inventoryItemId: '1',
        type: 'in',
        quantity: 50,
        reason: 'รับสินค้าเข้าใหม่',
        adjustedBy: '1'
      });

      expect(adjustment).toBeTruthy();
      expect(adjustment!.type).toBe('in');
      expect(adjustment!.quantity).toBe(50);
      expect(adjustment!.reason).toBe('รับสินค้าเข้าใหม่');

      // Verify stock increased
      const updatedItem = await mockDb.findInventoryById('1');
      expect(updatedItem!.currentStock).toBe(initialStock + 50);
    });

    it('should create stock adjustment and decrease inventory', async () => {
      // Get initial inventory item
      const item = await mockDb.findInventoryById('1');
      expect(item).toBeTruthy();
      const initialStock = item!.currentStock;

      // Create stock adjustment (out)
      const adjustment = await mockDb.createStockAdjustment({
        inventoryItemId: '1',
        type: 'out',
        quantity: 10,
        reason: 'สินค้าชำรุด',
        adjustedBy: '1'
      });

      expect(adjustment).toBeTruthy();
      expect(adjustment!.type).toBe('out');
      expect(adjustment!.quantity).toBe(10);

      // Verify stock decreased
      const updatedItem = await mockDb.findInventoryById('1');
      expect(updatedItem!.currentStock).toBe(initialStock - 10);
    });

    it('should prevent negative stock', async () => {
      // Get item with low stock
      const item = await mockDb.findInventoryById('8'); // Eraser with 0 stock
      expect(item).toBeTruthy();
      expect(item!.currentStock).toBe(0);

      // Try to create adjustment that would make stock negative
      const adjustment = await mockDb.createStockAdjustment({
        inventoryItemId: '8',
        type: 'out',
        quantity: 10,
        reason: 'ทดสอบ',
        adjustedBy: '1'
      });

      // Should fail
      expect(adjustment).toBeNull();

      // Verify stock unchanged
      const unchangedItem = await mockDb.findInventoryById('8');
      expect(unchangedItem!.currentStock).toBe(0);
    });

    it('should fail for non-existent inventory item', async () => {
      const adjustment = await mockDb.createStockAdjustment({
        inventoryItemId: '999',
        type: 'in',
        quantity: 10,
        reason: 'ทดสอบ',
        adjustedBy: '1'
      });

      expect(adjustment).toBeNull();
    });
  });

  describe('Stock Adjustment History', () => {
    it('should retrieve all stock adjustments', async () => {
      // Create multiple adjustments
      await mockDb.createStockAdjustment({
        inventoryItemId: '1',
        type: 'in',
        quantity: 50,
        reason: 'รับสินค้าเข้า',
        adjustedBy: '1'
      });

      await mockDb.createStockAdjustment({
        inventoryItemId: '2',
        type: 'out',
        quantity: 10,
        reason: 'สินค้าชำรุด',
        adjustedBy: '1'
      });

      const adjustments = await mockDb.findAllStockAdjustments();
      expect(adjustments.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter adjustments by inventory item', async () => {
      // Create adjustments for different items
      await mockDb.createStockAdjustment({
        inventoryItemId: '1',
        type: 'in',
        quantity: 50,
        reason: 'รับสินค้าเข้า',
        adjustedBy: '1'
      });

      await mockDb.createStockAdjustment({
        inventoryItemId: '2',
        type: 'in',
        quantity: 30,
        reason: 'รับสินค้าเข้า',
        adjustedBy: '1'
      });

      const adjustments = await mockDb.findAllStockAdjustments({
        inventoryItemId: '1'
      });

      expect(adjustments.every(adj => adj.inventoryItemId === '1')).toBe(true);
    });

    it('should filter adjustments by type', async () => {
      // Create adjustments of different types
      await mockDb.createStockAdjustment({
        inventoryItemId: '1',
        type: 'in',
        quantity: 50,
        reason: 'รับสินค้าเข้า',
        adjustedBy: '1'
      });

      await mockDb.createStockAdjustment({
        inventoryItemId: '1',
        type: 'out',
        quantity: 10,
        reason: 'สินค้าชำรุด',
        adjustedBy: '1'
      });

      const inAdjustments = await mockDb.findAllStockAdjustments({
        type: 'in'
      });

      expect(inAdjustments.every(adj => adj.type === 'in')).toBe(true);
    });
  });

  describe('Stock Adjustment Calculations', () => {
    it('should correctly calculate stock after multiple adjustments', async () => {
      const item = await mockDb.findInventoryById('3'); // Paper A4
      expect(item).toBeTruthy();
      const initialStock = item!.currentStock;

      // Add stock
      await mockDb.createStockAdjustment({
        inventoryItemId: '3',
        type: 'in',
        quantity: 100,
        reason: 'รับสินค้าเข้า',
        adjustedBy: '1'
      });

      // Remove stock
      await mockDb.createStockAdjustment({
        inventoryItemId: '3',
        type: 'out',
        quantity: 20,
        reason: 'สินค้าชำรุด',
        adjustedBy: '1'
      });

      // Add more stock
      await mockDb.createStockAdjustment({
        inventoryItemId: '3',
        type: 'in',
        quantity: 50,
        reason: 'รับสินค้าเข้า',
        adjustedBy: '1'
      });

      const finalItem = await mockDb.findInventoryById('3');
      expect(finalItem!.currentStock).toBe(initialStock + 100 - 20 + 50);
    });
  });
});
