'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Requisition, InventoryItem, ApiResponse } from '@/lib/types';
import { THAI_LABELS } from '@/lib/constants/thai-labels';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    pendingRequisitions: 0,
    lowStockItems: 0,
    totalRequisitions: 0,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch requisitions
      const reqResponse = await fetch('/api/requisitions');
      const reqData: ApiResponse<Requisition[]> = await reqResponse.json();
      
      // Fetch inventory
      const invResponse = await fetch('/api/inventory');
      const invData: ApiResponse<InventoryItem[]> = await invResponse.json();

      if (reqData.success && invData.success) {
        const requisitions = reqData.data || [];
        const inventory = invData.data || [];

        setStats({
          pendingRequisitions: requisitions.filter(r => r.status === 'pending').length,
          lowStockItems: inventory.filter(i => i.quantity <= i.minQuantity).length,
          totalRequisitions: requisitions.length,
          totalItems: inventory.length,
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    {
      title: THAI_LABELS.createRequisition,
      description: 'สร้างคำขอเบิกสินค้าใหม่',
      href: '/requisitions/create',
      icon: '➕',
      color: 'var(--color-primary)',
    },
    {
      title: THAI_LABELS.myRequisitions,
      description: 'ดูคำขอเบิกสินค้าของฉัน',
      href: '/requisitions',
      icon: '📋',
      color: '#3b82f6',
    },
    {
      title: THAI_LABELS.inventory,
      description: 'ตรวจสอบสินค้าคงคลัง',
      href: '/inventory',
      icon: '📦',
      color: '#10b981',
    },
    {
      title: THAI_LABELS.adminPanel,
      description: 'จัดการระบบ (สำหรับผู้ดูแล)',
      href: '/admin',
      icon: '⚙',
      color: '#8b5cf6',
    },
  ];

  const statCards = [
    {
      title: 'คำขอรออนุมัติ',
      value: stats.pendingRequisitions,
      icon: '⏳',
      color: '#f59e0b',
    },
    {
      title: 'สินค้าใกล้หมด',
      value: stats.lowStockItems,
      icon: '⚠️',
      color: '#ef4444',
    },
    {
      title: 'คำขอทั้งหมด',
      value: stats.totalRequisitions,
      icon: '📊',
      color: '#3b82f6',
    },
    {
      title: 'รายการสินค้า',
      value: stats.totalItems,
      icon: '📦',
      color: '#10b981',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          {THAI_LABELS.dashboard}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          ภาพรวมระบบเบิกสินค้า
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="p-6 rounded-lg"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <span
                className="text-3xl font-bold"
                style={{ color: stat.color }}
              >
                {loading ? '...' : stat.value}
              </span>
            </div>
            <h3
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {stat.title}
            </h3>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          เมนูด่วน
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block p-6 rounded-lg transition-all duration-200 hover:shadow-lg"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="text-center">
                <div
                  className="text-4xl mb-3"
                  style={{ color: link.color }}
                >
                  {link.icon}
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  {link.title}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {link.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
