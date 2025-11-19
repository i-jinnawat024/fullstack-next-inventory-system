'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Requisition, InventoryItem, ApiResponse } from '@/lib/types';
import { THAI_LABELS } from '@/lib/constants/thai-labels';
import { StatCard } from '@/components/dashboard/stat-card';
import { LineChart } from '@/components/dashboard/line-chart';
import { BarChart } from '@/components/dashboard/bar-chart';
import { DonutChart } from '@/components/dashboard/donut-chart';

interface DashboardStats {
  pendingRequisitions: number;
  lowStockItems: number;
  totalRequisitions: number;
  totalItems: number;
  approvedRequisitions: number;
  rejectedRequisitions: number;
  issuedRequisitions: number;
}

interface TrendData {
  month: string;
  requisitions: number;
  issued: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    pendingRequisitions: 0,
    lowStockItems: 0,
    totalRequisitions: 0,
    totalItems: 0,
    approvedRequisitions: 0,
    rejectedRequisitions: 0,
    issuedRequisitions: 0,
  });
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<Array<{ name: string; value: number; color?: string }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch requisitions
      const reqResponse = await fetch('/api/requisitions');
      const reqData: ApiResponse<Requisition[]> = await reqResponse.json();
      
      // Fetch inventory
      const invResponse = await fetch('/api/inventory');
      const invData: ApiResponse<InventoryItem[]> = await invResponse.json();

      if (reqData.success && invData.success) {
        const requisitions = reqData.data || [];
        const inventory = invData.data || [];

        // Calculate stats
        const pending = requisitions.filter(r => r.status === 'pending').length;
        const approved = requisitions.filter(r => r.status === 'approved').length;
        const rejected = requisitions.filter(r => r.status === 'rejected').length;
        const issued = requisitions.filter(r => r.status === 'issued').length;

        setStats({
          pendingRequisitions: pending,
          lowStockItems: inventory.filter(i => (i as any).quantity <= (i as any).minQuantity).length,
          totalRequisitions: requisitions.length,
          totalItems: inventory.length,
          approvedRequisitions: approved,
          rejectedRequisitions: rejected,
          issuedRequisitions: issued,
        });

        // Generate trend data (last 6 months)
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'];
        const trend: TrendData[] = months.map((month, index) => ({
          month,
          requisitions: Math.floor(Math.random() * 20) + 10,
          issued: Math.floor(Math.random() * 15) + 5,
        }));
        setTrendData(trend);

        // Status distribution for donut chart
        setStatusDistribution([
          { name: 'รออนุมัติ', value: pending, color: '#f59e0b' },
          { name: 'อนุมัติแล้ว', value: approved, color: '#10b981' },
          { name: 'จ่ายแล้ว', value: issued, color: '#3b82f6' },
          { name: 'ปฏิเสธ', value: rejected, color: '#ef4444' },
        ].filter(item => item.value > 0));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const quickLinks = [
    {
      title: THAI_LABELS.createRequisition,
      description: 'สร้างคำขอเบิกสินค้าใหม่',
      href: '/requisitions/create',
      icon: '➕',
      color: 'var(--color-primary)',
    },
    {
      title: THAI_LABELS.requisitions,
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

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Page Header - Responsive spacing */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          {THAI_LABELS.dashboard}
        </h1>
        <p className="text-sm md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
          ภาพรวมระบบเบิกสินค้า • อัปเดตอัตโนมัติทุก 30 วินาที
        </p>
      </div>

      {/* Key Metrics Section - Responsive spacing and grid */}
      <section className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          ตัวชี้วัดหลัก
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="คำขอรออนุมัติ"
            value={stats.pendingRequisitions}
            icon="⏳"
            color="#f59e0b"
            loading={loading}
            trend={stats.pendingRequisitions > 5 ? { value: 12, direction: 'up' } : undefined}
          />
          <StatCard
            title="สินค้าใกล้หมด"
            value={stats.lowStockItems}
            icon="⚠️"
            color="#ef4444"
            loading={loading}
            trend={stats.lowStockItems > 0 ? { value: 8, direction: 'down' } : undefined}
          />
          <StatCard
            title="คำขอทั้งหมด"
            value={stats.totalRequisitions}
            icon="📊"
            color="#3b82f6"
            loading={loading}
          />
          <StatCard
            title="รายการสินค้า"
            value={stats.totalItems}
            icon="📦"
            color="#10b981"
            loading={loading}
          />
        </div>
      </section>

      {/* Charts Section - Responsive spacing and grid */}
      <section className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          แนวโน้มและสถิติ
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Trend Chart */}
          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              แนวโน้มการเบิกสินค้า (6 เดือนล่าสุด)
            </h3>
            <LineChart
              data={trendData}
              xAxisKey="month"
              lines={[
                { dataKey: 'requisitions', name: 'คำขอทั้งหมด', color: '#3b82f6' },
                { dataKey: 'issued', name: 'จ่ายแล้ว', color: '#10b981' },
              ]}
              loading={loading}
              height={280}
            />
          </div>

          {/* Status Distribution */}
          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              การกระจายสถานะคำขอ
            </h3>
            <DonutChart
              data={statusDistribution}
              loading={loading}
              height={280}
            />
          </div>
        </div>
      </section>

      {/* Status Breakdown Section - Responsive spacing and grid */}
      <section className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          รายละเอียดสถานะ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <StatCard
            title="อนุมัติแล้ว"
            value={stats.approvedRequisitions}
            icon="✅"
            color="#10b981"
            loading={loading}
          />
          <StatCard
            title="จ่ายแล้ว"
            value={stats.issuedRequisitions}
            icon="📦"
            color="#3b82f6"
            loading={loading}
          />
          <StatCard
            title="ปฏิเสธ"
            value={stats.rejectedRequisitions}
            icon="❌"
            color="#ef4444"
            loading={loading}
          />
        </div>
      </section>

      {/* Quick Links Section - Responsive spacing and grid */}
      <section>
        <h2 className="text-lg md:text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          เมนูด่วน
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
      </section>
    </div>
  );
}
