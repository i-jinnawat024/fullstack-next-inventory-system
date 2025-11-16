'use client';

import { useState, useEffect } from 'react';
import { THAI_LABELS } from '@/lib/constants/thai-labels';
import { formatDate } from '@/lib/utils/format';
import { StockAdjustment, InventoryItem } from '@/lib/types';

interface EnrichedStockAdjustment extends StockAdjustment {
  inventoryItem: {
    id: string;
    code: string;
    name: string;
    unit: string;
  } | null;
  adjustedByUser: {
    id: string;
    name: string;
  } | null;
}

export default function StockAdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<EnrichedStockAdjustment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    inventoryItemId: '',
    type: 'in' as 'in' | 'out',
    quantity: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [adjustmentsRes, inventoryRes] = await Promise.all([
        fetch('/api/stock-adjustments'),
        fetch('/api/inventory')
      ]);

      if (adjustmentsRes.ok) {
        const data = await adjustmentsRes.json();
        setAdjustments(data.data || []);
      }

      if (inventoryRes.ok) {
        const data = await inventoryRes.json();
        setInventory(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.inventoryItemId || !formData.quantity || !formData.reason) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      setError('จำนวนต้องมากกว่า 0');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/stock-adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('ปรับปรุงสต็อกสำเร็จ');
        setFormData({
          inventoryItemId: '',
          type: 'in',
          quantity: '',
          reason: ''
        });
        setShowForm(false);
        fetchData();
      } else {
        setError(data.error?.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error('Error creating adjustment:', err);
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{THAI_LABELS.loading}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{THAI_LABELS.stockAdjustments}</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? THAI_LABELS.cancel : 'เพิ่มการปรับปรุงสต็อก'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {showForm && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">เพิ่มการปรับปรุงสต็อก</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {THAI_LABELS.productName} *
              </label>
              <select
                value={formData.inventoryItemId}
                onChange={(e) => setFormData({ ...formData, inventoryItemId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">เลือกสินค้า</option>
                {inventory.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code} - {item.name} (คงเหลือ: {item.currentStock} {item.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                ประเภท *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'in' | 'out' })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="in">เพิ่มสต็อก (รับเข้า)</option>
                <option value="out">ลดสต็อก (จ่ายออก)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {THAI_LABELS.quantity} *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {THAI_LABELS.reason} *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? THAI_LABELS.loading : THAI_LABELS.save}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                {THAI_LABELS.cancel}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {THAI_LABELS.date}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {THAI_LABELS.productCode}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {THAI_LABELS.productName}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ประเภท
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  {THAI_LABELS.quantity}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {THAI_LABELS.reason}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ผู้ปรับปรุง
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adjustments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {THAI_LABELS.noData}
                  </td>
                </tr>
              ) : (
                adjustments.map((adjustment) => (
                  <tr key={adjustment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDate(adjustment.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {adjustment.inventoryItem?.code || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {adjustment.inventoryItem?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded ${
                        adjustment.type === 'in' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {adjustment.type === 'in' ? 'รับเข้า' : 'จ่ายออก'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {adjustment.quantity} {adjustment.inventoryItem?.unit || ''}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {adjustment.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {adjustment.adjustedByUser?.name || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
