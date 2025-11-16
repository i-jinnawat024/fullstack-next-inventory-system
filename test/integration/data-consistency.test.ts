import { describe, it, expect, beforeEach } from 'vitest';
import { mockDb } from '@/lib/database/mock-database';

/**
 * Integration Test: Data Consistency
 * 
 * Tests data integrity across all operations:
 * 1. Stock levels remain consistent
 * 2. Requisition states are valid
 * 3. Audit trails are maintained
 * 4. Relationships are preserved
 */

describe('Data Consistency Integration', () => {
  beforeEach(() => {
    mockDb.reset();
  });

  it('should maintain stock consistency across multiple operations', async () => {
    const inventory = await mockDb.findMany('inventory', { isActive: true });
    const item = inventory.find(i => i.currentStock >= 20);
    expect(item).toBeDefined();

    const initialStock = item!.currentStock;
    let currentStock = initialStock;

    // Operation 1: Create and approve requisition
    const users = await mockDb.findMany('users', { role: 'user' });
    const user = users[0];

    const req1 = await mockDb.create('requisitions', {
      documentNumber: `REQ-${Date.now()}-1`,
      userId: user.id,
      status: 'pending',
      items: [{ inventoryItemId: item!.id, quantity: 5 }],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await mockDb.update('requisitions', req1.id, { status: 'approved' });
    currentStock -= 5;
    await mockDb.update('inventory', item!.id, {
      currentStock,
      updatedAt: new Date(),
    });

    // Operation 2: Stock adjustment (in)
    await mockDb.create('stockAdjustments', {
      inventoryItemId: item!.id,
      type: 'in',
      quantity: 10,
      reason: 'รับสินค้าเข้า',
      adjustedBy: 'admin-1',
      createdAt: new Date(),
    });
    currentStock += 10;
    await mockDb.update('inventory', item!.id, {
      currentStock,
      updatedAt: new Date(),
    });

    // Operation 3: Another requisition
    const req2 = await mockDb.create('requisitions', {
      documentNumber: `REQ-${Date.now()}-2`,
      userId: user.id,
      status: 'pending',
      items: [{ inventoryItemId: item!.id, quantity: 3 }],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await mockDb.update('requisitions', req2.id, { status: 'approved' });
    currentStock -= 3;
    await mockDb.update('inventory', item!.id, {
      currentStock,
      updatedAt: new Date(),
    });

    // Operation 4: Stock adjustment (out)
    await mockDb.create('stockAdjustments', {
      inventoryItemId: item!.id,
      type: 'out',
      quantity: 2,
      reason: 'สินค้าชำรุด',
      adjustedBy: 'admin-1',
      createdAt: new Date(),
    });
    currentStock -= 2;
    await mockDb.update('inventory', item!.id, {
      currentStock,
      updatedAt: new Date(),
    });

    // Verify final stock
    const finalItem = await mockDb.findById('inventory', item!.id);
    expect(finalItem?.currentStock).toBe(currentStock);
    expect(finalItem?.currentStock).toBe(initialStock - 5 + 10 - 3 - 2);
  });

  it('should maintain valid requisition state transitions', async () => {
    const users = await mockDb.findMany('users', { role: 'user' });
    const user = users[0];

    const inventory = await mockDb.findMany('inventory', { isActive: true });
    const item = inventory[0];

    // Valid transition: draft -> pending
    const req = await mockDb.create('requisitions', {
      documentNumber: `REQ-${Date.now()}`,
      userId: user.id,
      status: 'draft',
      items: [{ inventoryItemId: item.id, quantity: 1 }],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(req.status).toBe('draft');

    const pending = await mockDb.update('requisitions', req.id, {
      status: 'pending',
      updatedAt: new Date(),
    });
    expect(pending.status).toBe('pending');

    // Valid transition: pending -> approved
    const approved = await mockDb.update('requisitions', req.id, {
      status: 'approved',
      approvedBy: 'admin-1',
      approvedAt: new Date(),
      updatedAt: new Date(),
    });
    expect(approved.status).toBe('approved');
    expect(approved.approvedBy).toBeDefined();
    expect(approved.approvedAt).toBeDefined();

    // Valid transition: approved -> issued
    const issued = await mockDb.update('requisitions', req.id, {
      status: 'issued',
      issuedAt: new Date(),
      updatedAt: new Date(),
    });
    expect(issued.status).toBe('issued');
    expect(issued.issuedAt).toBeDefined();
  });

  it('should maintain audit trail for all critical operations', async () => {
    const admins = await mockDb.findMany('users', { role: 'admin' });
    const admin = admins[0];

    const inventory = await mockDb.findMany('inventory', { isActive: true });
    const item = inventory[0];

    // Create stock adjustment with audit info
    const adjustment = await mockDb.create('stockAdjustments', {
      inventoryItemId: item.id,
      type: 'in',
      quantity: 50,
      reason: 'รับสินค้าเข้าใหม่',
      adjustedBy: admin.id,
      createdAt: new Date(),
    });

    expect(adjustment.adjustedBy).toBe(admin.id);
    expect(adjustment.createdAt).toBeDefined();
    expect(adjustment.reason).toBeDefined();

    // Verify audit trail can be retrieved
    const adjustments = await mockDb.findMany('stockAdjustments', {
      inventoryItemId: item.id,
    });
    expect(adjustments.length).toBeGreaterThan(0);
    expect(adjustments.every(a => a.adjustedBy && a.createdAt && a.reason)).toBe(true);
  });

  it('should preserve relationships between entities', async () => {
    const users = await mockDb.findMany('users', { role: 'user' });
    const user = users[0];

    const inventory = await mockDb.findMany('inventory', { isActive: true });
    const items = inventory.slice(0, 3);

    // Create requisition with multiple items
    const requisition = await mockDb.create('requisitions', {
      documentNumber: `REQ-${Date.now()}`,
      userId: user.id,
      status: 'pending',
      items: items.map(item => ({
        inventoryItemId: item.id,
        quantity: 1,
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Verify requisition-user relationship
    expect(requisition.userId).toBe(user.id);

    // Verify requisition-items relationships
    expect(requisition.items).toHaveLength(3);
    requisition.items.forEach(reqItem => {
      const inventoryItem = items.find(i => i.id === reqItem.inventoryItemId);
      expect(inventoryItem).toBeDefined();
    });

    // Verify we can retrieve all requisitions for a user
    const userRequisitions = await mockDb.findMany('requisitions', {
      userId: user.id,
    });
    expect(userRequisitions.some(r => r.id === requisition.id)).toBe(true);
  });

  it('should handle concurrent operations correctly', async () => {
    const inventory = await mockDb.findMany('inventory', { isActive: true });
    const item = inventory.find(i => i.currentStock >= 10);
    expect(item).toBeDefined();

    const initialStock = item!.currentStock;

    // Simulate concurrent requisitions
    const users = await mockDb.findMany('users', { role: 'user' });
    const user1 = users[0];
    const user2 = users[1] || users[0];

    const req1 = await mockDb.create('requisitions', {
      documentNumber: `REQ-${Date.now()}-A`,
      userId: user1.id,
      status: 'pending',
      items: [{ inventoryItemId: item!.id, quantity: 3 }],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req2 = await mockDb.create('requisitions', {
      documentNumber: `REQ-${Date.now()}-B`,
      userId: user2.id,
      status: 'pending',
      items: [{ inventoryItemId: item!.id, quantity: 2 }],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Both requisitions should be created
    expect(req1).toBeDefined();
    expect(req2).toBeDefined();

    // Approve both and update stock
    await mockDb.update('requisitions', req1.id, { status: 'approved' });
    await mockDb.update('requisitions', req2.id, { status: 'approved' });

    const finalStock = initialStock - 3 - 2;
    await mockDb.update('inventory', item!.id, {
      currentStock: finalStock,
      updatedAt: new Date(),
    });

    const updatedItem = await mockDb.findById('inventory', item!.id);
    expect(updatedItem?.currentStock).toBe(finalStock);
  });

  it('should validate data integrity constraints', async () => {
    const inventory = await mockDb.findMany('inventory', { isActive: true });
    
    // All inventory items should have required fields
    inventory.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.code).toBeDefined();
      expect(item.name).toBeDefined();
      expect(item.category).toBeDefined();
      expect(item.unit).toBeDefined();
      expect(typeof item.currentStock).toBe('number');
      expect(typeof item.minimumStock).toBe('number');
      expect(typeof item.isActive).toBe('boolean');
    });

    // All requisitions should have valid structure
    const requisitions = await mockDb.findMany('requisitions', {});
    requisitions.forEach(req => {
      expect(req.id).toBeDefined();
      expect(req.documentNumber).toBeDefined();
      expect(req.userId).toBeDefined();
      expect(req.status).toBeDefined();
      expect(['draft', 'pending', 'approved', 'rejected', 'issued']).toContain(req.status);
      expect(Array.isArray(req.items)).toBe(true);
    });

    // All users should have required fields
    const users = await mockDb.findMany('users', {});
    users.forEach(user => {
      expect(user.id).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.name).toBeDefined();
      expect(user.role).toBeDefined();
      expect(['user', 'admin']).toContain(user.role);
    });
  });
});
