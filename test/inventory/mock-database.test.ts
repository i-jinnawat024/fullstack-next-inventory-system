import { describe, it, expect, beforeEach } from 'vitest';
import { MockDatabase } from '@/lib/database/mock-database';
import { InventoryItem } from '@/lib/types';

describe('MockDatabase - Inventory Operations', () => {
  let db: MockDatabase;

  beforeEach(() => {
    // Create a fresh instance for each test
    db = new (MockDatabase as any)();
  });

  describe('findAllInventory', () => {
    it('should return all active inventory items', async () => {
      const items = await db.findAllInventory();
      
      expect(items).toBeDefined();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
      
      // All items should be active
      items.forEach(item => {
        expect(item.isActive).toBe(true);
      });
    });

    it('should filter items by search term', async () => {
      const searchTerm = 'ปากกา';
      const items = await db.findAllInventory({ search: searchTerm });
      
      expect(items).toBeDefined();
      items.forEach(item => {
        const matchesSearch = 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase());
        expect(matchesSearch).toBe(true);
      });
    });

    it('should filter items by category', async () => {
      const category = 'เครื่องเขียน';
      const items = await db.findAllInventory({ category });
      
      expect(items).toBeDefined();
      items.forEach(item => {
        expect(item.category).toBe(category);
      });
    });

    it('should filter items by stock status - in-stock', async () => {
      const items = await db.findAllInventory({ stockStatus: 'in-stock' });
      
      expect(items).toBeDefined();
      items.forEach(item => {
        expect(item.currentStock).toBeGreaterThan(item.minimumStock);
      });
    });

    it('should filter items by stock status - low-stock', async () => {
      const items = await db.findAllInventory({ stockStatus: 'low-stock' });
      
      expect(items).toBeDefined();
      items.forEach(item => {
        expect(item.currentStock).toBeLessThanOrEqual(item.minimumStock);
        expect(item.currentStock).toBeGreaterThan(0);
      });
    });

    it('should filter items by stock status - out-of-stock', async () => {
      const items = await db.findAllInventory({ stockStatus: 'out-of-stock' });
      
      expect(items).toBeDefined();
      items.forEach(item => {
        expect(item.currentStock).toBe(0);
      });
    });
  });

  describe('findInventoryById', () => {
    it('should return item when found', async () => {
      const allItems = await db.findAllInventory();
      const firstItem = allItems[0];
      
      const foundItem = await db.findInventoryById(firstItem.id);
      
      expect(foundItem).toBeDefined();
      expect(foundItem?.id).toBe(firstItem.id);
      expect(foundItem?.name).toBe(firstItem.name);
    });

    it('should return null when item not found', async () => {
      const foundItem = await db.findInventoryById('non-existent-id');
      
      expect(foundItem).toBeNull();
    });
  });

  describe('createInventoryItem', () => {
    it('should create new inventory item successfully', async () => {
      const newItemData = {
        code: 'TEST-001',
        name: 'สินค้าทดสอบ',
        description: 'รายละเอียดสินค้าทดสอบ',
        category: 'ทดสอบ',
        unit: 'ชิ้น',
        currentStock: 100,
        minimumStock: 10,
        isActive: true,
      };

      const createdItem = await db.createInventoryItem(newItemData);
      
      expect(createdItem).toBeDefined();
      expect(createdItem.id).toBeDefined();
      expect(createdItem.code).toBe(newItemData.code);
      expect(createdItem.name).toBe(newItemData.name);
      expect(createdItem.currentStock).toBe(newItemData.currentStock);
      expect(createdItem.createdAt).toBeInstanceOf(Date);
      expect(createdItem.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('updateInventoryItem', () => {
    it('should update existing inventory item successfully', async () => {
      const allItems = await db.findAllInventory();
      const itemToUpdate = allItems[0];
      
      const updates = {
        name: 'ชื่อใหม่ที่อัปเดต',
        currentStock: 999,
      };

      const updatedItem = await db.updateInventoryItem(itemToUpdate.id, updates);
      
      expect(updatedItem).toBeDefined();
      expect(updatedItem?.name).toBe(updates.name);
      expect(updatedItem?.currentStock).toBe(updates.currentStock);
      expect(updatedItem?.updatedAt).toBeInstanceOf(Date);
      
      // Other fields should remain unchanged
      expect(updatedItem?.code).toBe(itemToUpdate.code);
      expect(updatedItem?.category).toBe(itemToUpdate.category);
    });

    it('should return null when updating non-existent item', async () => {
      const updates = { name: 'ชื่อใหม่' };
      const result = await db.updateInventoryItem('non-existent-id', updates);
      
      expect(result).toBeNull();
    });
  });

  describe('deleteInventoryItem', () => {
    it('should soft delete inventory item successfully', async () => {
      const allItems = await db.findAllInventory();
      const itemToDelete = allItems[0];
      
      const deleteResult = await db.deleteInventoryItem(itemToDelete.id);
      
      expect(deleteResult).toBe(true);
      
      // Item should no longer appear in active items
      const activeItems = await db.findAllInventory();
      const deletedItem = activeItems.find(item => item.id === itemToDelete.id);
      expect(deletedItem).toBeUndefined();
    });

    it('should return false when deleting non-existent item', async () => {
      const deleteResult = await db.deleteInventoryItem('non-existent-id');
      
      expect(deleteResult).toBe(false);
    });
  });

  describe('getInventoryCategories', () => {
    it('should return unique categories from active items', async () => {
      const categories = await db.getInventoryCategories();
      
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      
      // Should be unique values
      const uniqueCategories = [...new Set(categories)];
      expect(categories.length).toBe(uniqueCategories.length);
      
      // Should be sorted
      const sortedCategories = [...categories].sort();
      expect(categories).toEqual(sortedCategories);
    });
  });

  describe('API delay simulation', () => {
    it('should simulate API delay', async () => {
      const startTime = Date.now();
      await db.findAllInventory();
      const endTime = Date.now();
      
      // Should take at least 250ms (allowing some margin for test execution)
      expect(endTime - startTime).toBeGreaterThanOrEqual(250);
    });
  });
});