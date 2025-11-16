'use client';

import { useState, useEffect } from 'react';
import { InventoryItem, Notice } from '@/lib/types';
import { Table, Column } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { THAI_LABELS } from '@/lib/constants/thai-labels';
import { formatDate } from '@/lib/utils/format';

interface InventoryFilter {
  search: string;
  category: string;
  stockStatus: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<InventoryFilter>({
    search: '',
    category: 'all',
    stockStatus: 'all',
  });

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.search) params.append('search', filter.search);
      if (filter.category !== 'all') params.append('category', filter.category);
      if (filter.stockStatus !== 'all') params.append('stockStatus', filter.stockStatus);

      const response = await fetch(`/api/inventory?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setInventory(result.data);
      } else {
        console.error('Failed to fetch inventory:', result.error);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
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

  // Fetch notices
  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/notices');
      const result = await response.json();

      if (result.success) {
        setNotices(result.data);
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchNotices();
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [filter]);

  // Handle search input change with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchInventory();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filter.search]);

  const handleFilterChange = (key: keyof InventoryFilter, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilter({
      search: '',
      category: 'all',
      stockStatus: 'all',
    });
  };

  // Get stock status display
  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) {
      return { text: THAI_LABELS.outOfStock, color: 'var(--color-error)' };
    } else if (item.currentStock <= item.minimumStock) {
      return { text: THAI_LABELS.lowStock, color: 'var(--color-warning)' };
    } else {
      return { text: THAI_LABELS.inStock, color: 'var(--color-success)' };
    }
  };

  // Table columns configuration
  const columns: Column<InventoryItem>[] = [
    {
      key: 'imageUrl',
      header: 'รูปภาพ',
      width: '80px',
      align: 'center',
      render: (item) => (
        <div className="w-12 h-12 rounded-md overflow-hidden flex items-center justify-center"
             style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={item.imageUrl ? 'hidden' : 'flex items-center justify-center text-xs'} 
               style={{ color: 'var(--color-text-secondary)' }}>
            {THAI_LABELS.noImage}
          </div>
        </div>
      ),
    },
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
      header: THAI_LABELS.remaining,
      width: '100px',
      align: 'right',
      render: (item) => {
        const status = getStockStatus(item);
        return (
          <div className="text-right">
            <div className="font-semibold">{item.currentStock.toLocaleString()}</div>
            <div className="text-xs" style={{ color: status.color }}>
              {status.text}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          {THAI_LABELS.inventory}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          {THAI_LABELS.viewInventoryDescription}
        </p>
      </div>

      {/* Notices Banner */}
      {notices.length > 0 && (
        <div className="space-y-3">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="p-4 rounded-lg border-l-4"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderLeftColor: 'var(--color-primary)',
                borderColor: 'var(--color-border)',
              }}
            >
              <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                {notice.title}
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                {notice.content}
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                {formatDate(notice.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder={THAI_LABELS.searchProducts}
              value={filter.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <div>
            <select
              className="w-full px-3 py-2 rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
              value={filter.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="all">{THAI_LABELS.allCategories}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="w-full px-3 py-2 rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
              value={filter.stockStatus}
              onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
            >
              <option value="all">{THAI_LABELS.allStatuses}</option>
              <option value="in-stock">{THAI_LABELS.inStock}</option>
              <option value="low-stock">{THAI_LABELS.lowStock}</option>
              <option value="out-of-stock">{THAI_LABELS.outOfStock}</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            {THAI_LABELS.clear}
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <div
        className="rounded-lg border"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <Table
          data={inventory}
          columns={columns}
          loading={loading}
          emptyMessage={THAI_LABELS.noMatchingProducts}
        />
      </div>

      {/* Summary */}
      {!loading && inventory.length > 0 && (
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                {inventory.length}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {THAI_LABELS.totalItems}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>
                {inventory.filter(item => item.currentStock > item.minimumStock).length}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {THAI_LABELS.inStock}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>
                {inventory.filter(item => item.currentStock <= item.minimumStock && item.currentStock > 0).length}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {THAI_LABELS.lowStock}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-error)' }}>
                {inventory.filter(item => item.currentStock === 0).length}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {THAI_LABELS.outOfStock}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}