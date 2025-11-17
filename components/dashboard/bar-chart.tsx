'use client';

import { memo } from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils/format';

interface BarChartProps {
  data: Array<Record<string, any>>;
  xAxisKey: string;
  bars: Array<{
    dataKey: string;
    name: string;
    color?: string;
  }>;
  loading?: boolean;
  height?: number;
  className?: string;
}

export const BarChart = memo(function BarChart({
  data,
  xAxisKey,
  bars,
  loading = false,
  height = 300,
  className,
}: BarChartProps) {
  if (loading) {
    return <BarChartSkeleton height={height} className={className} />;
  }

  if (!data || data.length === 0) {
    return (
      <div
        className={cn('flex items-center justify-center rounded-lg', className)}
        style={{
          height: `${height}px`,
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <p style={{ color: 'var(--color-text-secondary)' }}>ไม่มีข้อมูล</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey={xAxisKey}
            stroke="var(--color-text-secondary)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="var(--color-text-secondary)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              color: 'var(--color-text)',
            }}
          />
          <Legend
            wrapperStyle={{
              color: 'var(--color-text)',
              fontSize: '12px',
            }}
          />
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color || 'var(--color-primary)'}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
});

export const BarChartSkeleton = memo(function BarChartSkeleton({ height = 300, className }: { height?: number; className?: string }) {
  return (
    <div
      className={cn('rounded-lg p-4', className)}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <Skeleton variant="rectangular" width="100%" height={height} />
    </div>
  );
});
