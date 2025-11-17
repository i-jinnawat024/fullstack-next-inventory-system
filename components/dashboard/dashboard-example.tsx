/**
 * Dashboard Components Usage Example
 * 
 * This file demonstrates how to use the dashboard components
 * in your application.
 */

'use client';

import { useState, useEffect } from 'react';
import { StatCard, LineChart, BarChart, DonutChart } from '@/components/dashboard';

export function DashboardExample() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Example: StatCard with trend
  const statCardExample = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="คำขอรออนุมัติ"
        value={42}
        icon="⏳"
        color="#f59e0b"
        trend={{ value: 12, direction: 'up' }}
        loading={loading}
      />
      
      <StatCard
        title="สินค้าใกล้หมด"
        value={8}
        icon="⚠️"
        color="#ef4444"
        trend={{ value: 5, direction: 'down' }}
        loading={loading}
      />
      
      <StatCard
        title="คำขอทั้งหมด"
        value={156}
        icon="📊"
        color="#3b82f6"
        loading={loading}
      />
      
      <StatCard
        title="รายการสินค้า"
        value={234}
        icon="📦"
        color="#10b981"
        loading={loading}
      />
    </div>
  );

  // Example: LineChart for trends
  const lineChartData = [
    { month: 'ม.ค.', requisitions: 15, issued: 12 },
    { month: 'ก.พ.', requisitions: 20, issued: 18 },
    { month: 'มี.ค.', requisitions: 18, issued: 15 },
    { month: 'เม.ย.', requisitions: 25, issued: 22 },
    { month: 'พ.ค.', requisitions: 22, issued: 20 },
    { month: 'มิ.ย.', requisitions: 28, issued: 25 },
  ];

  const lineChartExample = (
    <div
      className="p-6 rounded-lg"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
        แนวโน้มการเบิกสินค้า
      </h3>
      <LineChart
        data={lineChartData}
        xAxisKey="month"
        lines={[
          { dataKey: 'requisitions', name: 'คำขอทั้งหมด', color: '#3b82f6' },
          { dataKey: 'issued', name: 'จ่ายแล้ว', color: '#10b981' },
        ]}
        height={300}
        loading={loading}
      />
    </div>
  );

  // Example: BarChart for comparisons
  const barChartData = [
    { category: 'อิเล็กทรอนิกส์', count: 25 },
    { category: 'เครื่องเขียน', count: 18 },
    { category: 'เครื่องใช้สำนักงาน', count: 32 },
    { category: 'อุปกรณ์ทำความสะอาด', count: 15 },
    { category: 'อื่นๆ', count: 10 },
  ];

  const barChartExample = (
    <div
      className="p-6 rounded-lg"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
        การเบิกสินค้าตามหมวดหมู่
      </h3>
      <BarChart
        data={barChartData}
        xAxisKey="category"
        bars={[
          { dataKey: 'count', name: 'จำนวน', color: '#3b82f6' },
        ]}
        height={300}
        loading={loading}
      />
    </div>
  );

  // Example: DonutChart for distribution
  const donutChartData = [
    { name: 'รออนุมัติ', value: 10, color: '#f59e0b' },
    { name: 'อนุมัติแล้ว', value: 25, color: '#10b981' },
    { name: 'จ่ายแล้ว', value: 30, color: '#3b82f6' },
    { name: 'ปฏิเสธ', value: 5, color: '#ef4444' },
  ];

  const donutChartExample = (
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
        data={donutChartData}
        height={300}
        loading={loading}
      />
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Dashboard Components Example
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          ตัวอย่างการใช้งาน Dashboard Components
        </p>
      </div>

      {/* StatCards */}
      <section>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          StatCard Examples
        </h2>
        {statCardExample}
      </section>

      {/* Charts */}
      <section>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          Chart Examples
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {lineChartExample}
          {donutChartExample}
        </div>
      </section>

      {/* Bar Chart */}
      <section>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          BarChart Example
        </h2>
        {barChartExample}
      </section>
    </div>
  );
}
