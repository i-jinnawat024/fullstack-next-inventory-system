'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InventoryItem, CreateRequisitionForm } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Table, Column } from '@/components/ui/table';
import { THAI_LABELS } from '@/lib/constants/thai-labels';

interface RequisitionItem {
  inventoryItemId: string;
  quantity: number;
  item?: InventoryItem;
}

export default function CreateRequisitionPage() {
  const router = useRouter();
  const [items, setItems] = useState<RequisitionItem[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch inventory for selection
  const fetchInventory = async () => {
    try {
      setInventoryLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      params.append('stockStatus', 'in-stock'); // Only show items with stock

      const response = await fetch(`/api/inventory?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setInventory(result.data.filter((item: InventoryItem) => item.currentStock > 0));
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setInventoryLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/inventory/categories');
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (showInventoryModal) {
      fetchInventory();
    }
  }, [showInventoryModal, searchTerm, categoryFilter]);

  // Add item to requisition
  const addItem = (inventoryItem: InventoryItem) => {
    const existingIndex = items.findIndex(item => item.inventoryItemId === inventoryItem.id);
    
    if (existingIndex >= 0) {
      // Update quantity if item already exists
      const newItems = [...items];
      newItems[existingIndex].quantity += 1;
      setItems(newItems);
    } else {
      // Add new item
      setItems([...items, {
        inventoryItemId: inventoryItem.id,
        quantity: 1,
        item: inventoryItem
      }]);
    }
    
    setShowInventoryModal(false);
  };

  // Update item quantity
  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }

    const newItems = [...items];
    newItems[index].quantity = quantity;
    setItems(newItems);
  };

  // Remove item from requisition
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Save as draft
  const saveDraft = async () => {
    if (items.length === 0) {
      alert('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ');
      return;
    }

    try {
      setLoading(true);
      const formData: CreateRequisitionForm = {
        items: items.map(item => ({
          inventoryItemId: item.inventoryItemId,
          quantity: item.quantity
        })),
        notes
      };

      const response = await fetch('/api/requisitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'draft'
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('บันทึกร่างเรียบร้อยแล้ว');
        router.push('/requisitions/history');
      } else {
        alert(result.error?.message || 'เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  // Submit requisition
  const submitRequisition = async () => {
    if (items.length === 0) {
      alert('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ');
      return;
    }

    // Validate stock availability
    const invalidItems = items.filter(item => 
      item.item && item.quantity > item.item.currentStock
    );

    if (invalidItems.length > 0) {
      alert('มีสินค้าที่จำนวนที่ขอเกินสต็อกที่มีอยู่ กรุณาตรวจสอบอีกครั้ง');
      return;
    }

    try {
      setLoading(true);
      const formData: CreateRequisitionForm = {
        items: items.map(item => ({
          inventoryItemId: item.inventoryItemId,
          quantity: item.quantity
        })),
        notes
      };

      const response = await fetch('/api/requisitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert('ส่งคำขอเบิกสินค้าเรียบร้อยแล้ว');
        router.push('/requisitions/history');
      } else {
        alert(result.error?.message || 'เกิดข้อผิดพลาดในการส่งคำขอ');
      }
    } catch (error) {
      console.error('Error submitting requisition:', error);
      alert('เกิดข้อผิดพลาดในการส่งคำขอ');
    } finally {
      setLoading(false);
    }
  };

  // Inventory selection table columns
  const inventoryColumns: Column<InventoryItem>[] = [
    {
      key: 'code',
      header: THAI_LABELS.productCode,
      width: '120px',
      render: (item) => (
        <span className="font-mono text-sm" style={{ color: 'var(--color-primary)' }}>
          {item.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: THAI_LABELS.productName,
      render: (item) => (
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {item.description}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: THAI_LABELS.category,
      width: '120px',
    },
    {
      key: 'currentStock',
      header: THAI_LABELS.remaining,
      width: '100px',
      align: 'right',
      render: (item) => (
        <div className="text-right">
          <div className="font-semibold">{item.currentStock.toLocaleString()}</div>
          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {item.unit}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'เลือก',
      width: '80px',
      align: 'center',
      render: (item) => (
        <Button
          size="sm"
          onClick={() => addItem(item)}
          disabled={item.currentStock === 0}
        >
          เลือก
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          {THAI_LABELS.createRequisition}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          สร้างใบเบิกสินค้าใหม่
        </p>
      </div>

      {/* Add Items Section */}
      <div
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
            รายการสินค้า
          </h2>
          <Button onClick={() => setShowInventoryModal(true)}>
            เพิ่มสินค้า
          </Button>
        </div>

        {items.length === 0 ? (
          <div
            className="text-center py-8"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            ยังไม่มีรายการสินค้า กรุณาเพิ่มสินค้าที่ต้องการเบิก
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-md border"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex-1">
                  <div className="font-medium">{item.item?.name}</div>
                  <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {item.item?.code} • {item.item?.category}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm">จำนวน:</label>
                  <Input
                    type="number"
                    min="1"
                    max={item.item?.currentStock}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {item.item?.unit}
                  </span>
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  คงเหลือ: {item.item?.currentStock?.toLocaleString()}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  ลบ
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
          {THAI_LABELS.notes}
        </label>
        <textarea
          className="w-full px-3 py-2 rounded-md border resize-none transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
          rows={3}
          placeholder={THAI_LABELS.enterNotes}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          {THAI_LABELS.cancel}
        </Button>
        <Button
          variant="outline"
          onClick={saveDraft}
          disabled={loading || items.length === 0}
        >
          บันทึกร่าง
        </Button>
        <Button
          onClick={submitRequisition}
          disabled={loading || items.length === 0}
        >
          {loading ? 'กำลังส่ง...' : 'ส่งคำขอ'}
        </Button>
      </div>

      {/* Inventory Selection Modal */}
      <Modal
        isOpen={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
        title="เลือกสินค้า"
        size="xl"
      >
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder={THAI_LABELS.searchProducts}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="px-3 py-2 rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">ทุกหมวดหมู่</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Inventory Table */}
          <div
            className="rounded-lg border max-h-96 overflow-hidden"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <Table
              data={inventory}
              columns={inventoryColumns}
              loading={inventoryLoading}
              emptyMessage="ไม่พบสินค้าที่มีสต็อก"
            />
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowInventoryModal(false)}
            >
              {THAI_LABELS.close}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}