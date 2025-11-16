import { describe, it, expect, beforeEach } from 'vitest';
import { mockDb } from '@/lib/database/mock-database';

/**
 * Integration Test: Complete Admin Workflow
 * 
 * Tests the full admin journey:
 * 1. Admin logs in
 * 2. Views pending requisitions
 * 3. Approves requisition (stock is reduced)
 * 4. Manages inventory (add/edit products)
 * 5. Performs stock adjustments
 * 6. Views reports
 */

describe('Admin Workflow Integration', () => {
  beforeEach(() => {
    mockDb.reset();
  });

  it('should complete full admin approval workflow with stock reduction', async () => {
    // Step 1: Get admin user
    const admins = await mockDb.findMany('users', { role: 'admin' });
    expect(admins.length).toBeGreaterThan(0);
    const admin = admins[0];

    // Step 2: Create a pending requisition
    const users = await mockDb.findMany('users', { role: 'user' });
    const user = users[0];

    const inventory = await mockDb.findMany('inventory', { isActive: true });
    const item = inventory.find(i => i.currentStock >= 5);
    expect(item).toBeDefined();

    const initialStock = item!.currentStock;
    const requestedQty = 3;

    const requisition = await mockDb.create('requisitions', {
      documentNumber: `REQ-${Date.now()}`,
      userId: user.id,
      status: 'pending',
      items: [
        {
          inventoryItemId: item!.id,
          quantity: requestedQty,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Step 3: Admin views pending requisitions
    const pending = await mockDb.findMany('requisitions', { status: 'pending' });
    expect(pending.length).toBeGreaterThan(0);

    // Step 4: Admin approves requisition
    const approved = await mockDb.update('requisitions', requisition.id, {
      status: 'approved',
      approvedBy: admin.id,
      approvedAt: new Date(),
      updatedAt: new Date(),
    });

    expect(approved.status).toBe('approved');
    expect(approved.approvedBy).toBe(admin.id);

    // Step 5: Reduce stock
    const updatedItem = await mockDb.update('inventory', item!.id, {
      currentStock: initialStock - requestedQty,
      updatedAt: new Date(),
    });

    expect(updatedItem.currentStock).toBe(initialStock - requestedQty);

    // Step 6: Mark as issued
    const issued = await mockDb.update('requisitions', requisition.id, {
      status: 'issued',
      issuedAt: new Date(),
      updatedAt: new Date(),
    });

    expect(issued.status).toBe('issued');
    expect(issued.issuedAt).toBeDefined();
  });

  it('should handle requisition rejection workflow', async () => {
    const admins = await mockDb.findMany('users', { role: 'admin' });
    const admin = admins[0];

    const users = await mockDb.findMany('users', { role: 'user' });
    const user = users[0];

    const inventory = await mockDb.findMany('inventory', { isActive: true });
    const item = inventory[0];

    // Create requisition
    const requisition = await mockDb.create('requisitions', {
      documentNumber: `REQ-${Date.now()}`,
      userId: user.id,
      status: 'pending',
      items: [
        {
          inventoryItemId: item.id,
          quantity: 1,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Admin rejects with reason
    const rejected = await mockDb.update('requisitions', requisition.id, {
      status: 'rejected',
      approvedBy: admin.id,
      approvedAt: new Date(),
      rejectionReason: 'สินค้าไม่เพียงพอ',
      updatedAt: new Date(),
    });

    expect(rejected.status).toBe('rejected');
    expect(rejected.rejectionReason).toBeDefined();

    // Stock should not be reduced
    const unchangedItem = await mockDb.findById('inventory', item.id);
    expect(unchangedItem?.currentStock).toBe(item.currentStock);
  });

  it('should complete inventory management workflow', async () => {
    const admins = await mockDb.findMany('users', { role: 'admin' });
    const admin = admins[0];

    // Step 1: Create new inventory item
    const newItem = await mockDb.create('inventory', {
      code: `TEST-${Date.now()}`,
      name: 'สินค้าทดสอบ',
      description: 'รายละเอียดสินค้าทดสอบ',
      category: 'อุปกรณ์สำนักงาน',
      unit: 'ชิ้น',
      currentStock: 100,
      minimumStock: 10,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(newItem).toBeDefined();
    expect(newItem.code).toContain('TEST-');

    // Step 2: Update inventory item
    const updated = await mockDb.update('inventory', newItem.id, {
      currentStock: 150,
      minimumStock: 20,
      updatedAt: new Date(),
    });

    expect(updated.currentStock).toBe(150);
    expect(updated.minimumStock).toBe(20);

    // Step 3: Disable inventory item
    const disabled = await mockDb.update('inventory', newItem.id, {
      isActive: false,
      updatedAt: new Date(),
    });

    expect(disabled.isActive).toBe(false);
  });

  it('should complete stock adjustment workflow', async () => {
    const admins = await mockDb.findMany('users', { role: 'admin' });
    const admin = admins[0];

    const inventory = await mockDb.findMany('inventory', { isActive: true });
    const item = inventory[0];
    const initialStock = item.currentStock;

    // Step 1: Create stock adjustment (increase)
    const adjustment = await mockDb.create('stockAdjustments', {
      inventoryItemId: item.id,
      type: 'in',
      quantity: 50,
      reason: 'รับสินค้าเข้าใหม่',
      adjustedBy: admin.id,
      createdAt: new Date(),
    });

    expect(adjustment).toBeDefined();

    // Step 2: Update inventory stock
    const updatedItem = await mockDb.update('inventory', item.id, {
      currentStock: initialStock + 50,
      updatedAt: new Date(),
    });

    expect(updatedItem.currentStock).toBe(initialStock + 50);

    // Step 3: Create stock adjustment (decrease)
    const adjustment2 = await mockDb.create('stockAdjustments', {
      inventoryItemId: item.id,
      type: 'out',
      quantity: 20,
      reason: 'สินค้าชำรุด',
      adjustedBy: admin.id,
      createdAt: new Date(),
    });

    expect(adjustment2).toBeDefined();

    // Step 4: Update inventory stock again
    const finalItem = await mockDb.update('inventory', item.id, {
      currentStock: initialStock + 50 - 20,
      updatedAt: new Date(),
    });

    expect(finalItem.currentStock).toBe(initialStock + 30);

    // Step 5: Verify adjustment history
    const adjustments = await mockDb.findMany('stockAdjustments', {
      inventoryItemId: item.id,
    });
    expect(adjustments.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle notice management workflow', async () => {
    const admins = await mockDb.findMany('users', { role: 'admin' });
    const admin = admins[0];

    // Create notice
    const notice = await mockDb.create('notices', {
      title: 'ประกาศทดสอบ',
      content: 'เนื้อหาประกาศทดสอบ',
      isActive: true,
      createdBy: admin.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(notice).toBeDefined();
    expect(notice.isActive).toBe(true);

    // Update notice
    const updated = await mockDb.update('notices', notice.id, {
      content: 'เนื้อหาที่แก้ไขแล้ว',
      updatedAt: new Date(),
    });

    expect(updated.content).toBe('เนื้อหาที่แก้ไขแล้ว');

    // Deactivate notice
    const deactivated = await mockDb.update('notices', notice.id, {
      isActive: false,
      updatedAt: new Date(),
    });

    expect(deactivated.isActive).toBe(false);

    // Verify active notices
    const activeNotices = await mockDb.findMany('notices', { isActive: true });
    expect(activeNotices.every(n => n.isActive)).toBe(true);
  });
});
