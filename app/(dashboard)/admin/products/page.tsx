'use client';

import { useState, useEffect } from 'react';
import { InventoryItem, CreateInventoryItemForm } from '@/lib/types';
import { Table, Column } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StatusBadge } from '@/components/ui/status-badge';
import { THAI_LABELS } from '@/lib/constants/thai-labels';

interface ProductFormData extends CreateInventoryItemForm {
  id?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    code: '',
    name: '',
    description: '',
    category: '',
    unit: '',
    currentStock: 0,
    minimumStock: 0,
    imageUrl: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/inventory?${params.toString()}`);
      const result = await response.json();
      console.log(result)
      if (result.success) {
        setProducts(result.data);
      } else {
        console.error('Failed to fetch products:', result.error);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
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
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle form input changes
  const handleInputChange = (field: keyof ProductFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.code.trim()) errors.code = 'กรุณากรอกรหัสสินค้า';
    if (!formData.name.trim()) errors.name = 'กรุณากรอกชื่อสินค้า';
    if (!formData.description.trim()) errors.description = 'กรุณากรอกรายละเอียด';
    if (!formData.category.trim()) errors.category = 'กรุณากรอกหมวดหมู่';
    if (!formData.unit.trim()) errors.unit = 'กรุณากรอกหน่วย';
    if (formData.currentStock < 0) errors.currentStock = 'จำนวนสต็อกต้องไม่ติดลบ';
    if (formData.minimumStock < 0) errors.minimumStock = 'สต็อกขั้นต่ำต้องไม่ติดลบ';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      const url = editingProduct ? `/api/inventory/${editingProduct.id}` : '/api/inventory';
      const method = editingProduct ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        await fetchProducts();
        await fetchCategories(); // Refresh categories in case new one was added
        handleCloseModal();
        // Show success message (you could add a toast notification here)
      } else {
        if (result.error.code === 'DUPLICATE_CODE') {
          setFormErrors({ code: 'รหัสสินค้านี้มีอยู่แล้ว' });
        } else {
          console.error('Failed to save product:', result.error);
          // Show error message
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      // Show error message
    } finally {
      setSubmitting(false);
    }
  };

  // Handle opening modal for new product
  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      category: '',
      unit: '',
      currentStock: 0,
      minimumStock: 0,
      imageUrl: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Handle opening modal for editing product
  const handleEditProduct = (product: InventoryItem) => {
    setEditingProduct(product);
    setFormData({
      code: product.code,
      name: product.name,
      description: product.description,
      category: product.category,
      unit: product.unit,
      currentStock: product.currentStock,
      minimumStock: product.minimumStock,
      imageUrl: product.imageUrl || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      category: '',
      unit: '',
      currentStock: 0,
      minimumStock: 0,
      imageUrl: '',
    });
    setFormErrors({});
  };

  // Handle product disable/enable
  const handleToggleProduct = async (product: InventoryItem) => {
    try {
      const response = await fetch(`/api/inventory/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !product.isActive }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchProducts();
      } else {
        console.error('Failed to toggle product:', result.error);
      }
    } catch (error) {
      console.error('Error toggling product:', error);
    }
  };

  // Get stock status badge
  const getStockStatusBadge = (item: InventoryItem) => {
    if (item.currentStock === 0) {
      return (
        <StatusBadge 
          status="rejected" 
          size="sm"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
        />
      );
    } else if (item.currentStock <= item.minimumStock) {
      return (
        <StatusBadge 
          status="pending" 
          size="sm"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      );
    } else {
      return (
        <StatusBadge 
          status="approved" 
          size="sm"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
        />
      );
    }
  };

  // Table columns configuration
  const columns: Column<InventoryItem>[] = [
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
      key: 'unit',
      header: THAI_LABELS.unit,
      width: '80px',
      align: 'center',
    },
    {
      key: 'currentStock',
      header: THAI_LABELS.currentStock,
      width: '150px',
      align: 'right',
      render: (item) => (
        <div className="flex flex-col items-end gap-2">
          <div className="font-semibold">{item.currentStock.toLocaleString()}</div>
          {getStockStatusBadge(item)}
        </div>
      ),
    },
    {
      key: 'minimumStock',
      header: THAI_LABELS.minimumStock,
      width: '100px',
      align: 'right',
      render: (item) => item.minimumStock.toLocaleString(),
    },
    {
      key: 'isActive',
      header: 'สถานะ',
      width: '120px',
      align: 'center',
      render: (item) => (
        <StatusBadge 
          status={item.isActive ? 'approved' : 'cancelled'} 
          size="sm"
          icon={
            item.isActive ? (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )
          }
        />
      ),
    },
    {
      key: 'actions',
      header: 'การจัดการ',
      width: '150px',
      align: 'center',
      render: (item) => (
        <div className="flex space-x-2 justify-center">
          <Button
            size="sm"
            variant="outline"
            className='cursor-pointer'
            onClick={() => handleEditProduct(item)}
          >
            {THAI_LABELS.edit}
          </Button>
          <Button
            size="sm"
            variant={item.isActive ? 'danger' : 'secondary'}
            className="cursor-pointer whitespace-nowrap min-w-[64px]"
            onClick={() => handleToggleProduct(item)}
          >
            {item.isActive ? 'ปิดใช้' : 'เปิดใช้'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            {THAI_LABELS.products}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            จัดการข้อมูลสินค้าในระบบ
          </p>
        </div>
        <Button onClick={handleAddProduct}>
          {THAI_LABELS.add} สินค้าใหม่
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="ค้นหาสินค้า..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Products Table */}
      <div
        className="rounded-lg border"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <Table
          data={products}
          columns={columns}
          loading={loading}
          emptyMessage="ไม่พบสินค้าที่ตรงกับเงื่อนไขการค้นหา"
        />
      </div>

      {/* Product Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={THAI_LABELS.productCode}
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              error={formErrors.code}
              required
              placeholder="เช่น PEN-001"
            />
            <Input
              label={THAI_LABELS.productName}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={formErrors.name}
              required
              placeholder="เช่น ปากกาลูกลื่น สีน้ำเงิน"
            />
          </div>

          <Input
            label={THAI_LABELS.description}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={formErrors.description}
            required
            placeholder="รายละเอียดของสินค้า"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                {THAI_LABELS.category} <span className="text-red-500">*</span>
              </label>
              <input
                list="categories"
                className="w-full px-3 py-2 rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: formErrors.category ? 'var(--color-error)' : 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="เลือกหรือพิมพ์หมวดหมู่ใหม่"
                required
              />
              <datalist id="categories">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
              {formErrors.category && (
                <p className="mt-1 text-sm" style={{ color: 'var(--color-error)' }}>
                  {formErrors.category}
                </p>
              )}
            </div>
            <Input
              label={THAI_LABELS.unit}
              value={formData.unit}
              onChange={(e) => handleInputChange('unit', e.target.value)}
              error={formErrors.unit}
              required
              placeholder="เช่น ด้าม, กล่อง, ชิ้น"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={THAI_LABELS.currentStock}
              type="number"
              min="0"
              value={formData.currentStock}
              onChange={(e) => handleInputChange('currentStock', parseInt(e.target.value) || 0)}
              error={formErrors.currentStock}
              required
            />
            <Input
              label={THAI_LABELS.minimumStock}
              type="number"
              min="0"
              value={formData.minimumStock}
              onChange={(e) => handleInputChange('minimumStock', parseInt(e.target.value) || 0)}
              error={formErrors.minimumStock}
              required
            />
          </div>

          <Input
            label="URL รูปภาพ (ไม่บังคับ)"
            value={formData.imageUrl}
            onChange={(e) => handleInputChange('imageUrl', e.target.value)}
            placeholder="https://example.com/image.jpg"
            helperText="ใส่ URL ของรูปภาพสินค้า หรือเว้นว่างไว้"
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={submitting}
            >
              {THAI_LABELS.cancel}
            </Button>
            <Button
              type="submit"
              loading={submitting}
              disabled={submitting}
            >
              {editingProduct ? THAI_LABELS.update : THAI_LABELS.create}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}