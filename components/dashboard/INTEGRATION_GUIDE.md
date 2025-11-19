# Dashboard Components Integration Guide

Quick guide to integrate dashboard components into your application.

## Installation

The dashboard components use `recharts` for data visualization. Ensure it's installed:

```bash
pnpm install recharts
```

## Quick Start

### 1. Import Components

```tsx
import { StatCard, LineChart, BarChart, DonutChart } from '@/components/dashboard';
```

### 2. Basic StatCard

```tsx
<StatCard
  title="คำขอรออนุมัติ"
  value={42}
  icon="⏳"
  color="#f59e0b"
  loading={false}
/>
```

### 3. StatCard with Trend

```tsx
<StatCard
  title="สินค้าใกล้หมด"
  value={8}
  icon="⚠️"
  color="#ef4444"
  trend={{ value: 12, direction: 'down' }}
  loading={false}
/>
```

### 4. LineChart

```tsx
const data = [
  { month: 'ม.ค.', value1: 15, value2: 12 },
  { month: 'ก.พ.', value1: 20, value2: 18 },
  // ...
];

<LineChart
  data={data}
  xAxisKey="month"
  lines={[
    { dataKey: 'value1', name: 'Series 1', color: '#3b82f6' },
    { dataKey: 'value2', name: 'Series 2', color: '#10b981' },
  ]}
  height={300}
/>
```

### 5. BarChart

```tsx
const data = [
  { category: 'Category A', count: 25 },
  { category: 'Category B', count: 18 },
  // ...
];

<BarChart
  data={data}
  xAxisKey="category"
  bars={[
    { dataKey: 'count', name: 'Count', color: '#3b82f6' },
  ]}
  height={300}
/>
```

### 6. DonutChart

```tsx
const data = [
  { name: 'Status A', value: 10, color: '#f59e0b' },
  { name: 'Status B', value: 25, color: '#10b981' },
  // ...
];

<DonutChart
  data={data}
  height={300}
/>
```

## Responsive Grid Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatCard {...props} />
  <StatCard {...props} />
  <StatCard {...props} />
  <StatCard {...props} />
</div>
```

## Auto-Refresh Pattern

```tsx
import { useState, useEffect, useCallback } from 'react';

function MyDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div>
      <StatCard value={data.length} loading={loading} {...otherProps} />
    </div>
  );
}
```

## Section Layout Pattern

```tsx
<div className="p-6 space-y-8">
  {/* Section 1: Key Metrics */}
  <section>
    <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
      ตัวชี้วัดหลัก
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard {...props} />
      {/* More stat cards */}
    </div>
  </section>

  {/* Section 2: Charts */}
  <section>
    <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
      แนวโน้มและสถิติ
    </h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-lg" style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}>
        <h3 className="text-lg font-semibold mb-4">Chart Title</h3>
        <LineChart {...props} />
      </div>
      {/* More charts */}
    </div>
  </section>
</div>
```

## Loading States

All components support loading states:

```tsx
<StatCard loading={true} {...props} />
<LineChart loading={true} {...props} />
<BarChart loading={true} {...props} />
<DonutChart loading={true} {...props} />
```

## Empty States

Charts automatically show empty states when data is empty:

```tsx
<LineChart data={[]} {...props} />
// Shows: "ไม่มีข้อมูล"
```

## Color Palette

Recommended colors for consistency:

```tsx
const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  orange: '#f97316',
};
```

## TypeScript Types

```tsx
import type { StatCardProps } from '@/components/dashboard/stat-card';
import type { LineChartProps } from '@/components/dashboard/line-chart';
import type { BarChartProps } from '@/components/dashboard/bar-chart';
import type { DonutChartProps } from '@/components/dashboard/donut-chart';
```

## Common Patterns

### Metric with Percentage Change

```tsx
const calculateTrend = (current: number, previous: number) => {
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(Math.round(change)),
    direction: change >= 0 ? 'up' : 'down',
  };
};

<StatCard
  value={currentValue}
  trend={calculateTrend(currentValue, previousValue)}
  {...props}
/>
```

### Formatting Large Numbers

```tsx
// StatCard automatically formats numbers using Thai locale
<StatCard value={1234567} {...props} />
// Displays: 1,234,567
```

### Custom Chart Colors

```tsx
<LineChart
  lines={[
    { dataKey: 'value1', name: 'Name 1', color: '#custom-color' },
  ]}
  {...props}
/>
```

## Best Practices

1. **Always provide loading states** for better UX
2. **Use meaningful colors** that match your data
3. **Keep titles concise** (max 2-3 words)
4. **Group related metrics** into sections
5. **Use auto-refresh** for real-time dashboards
6. **Handle empty states** gracefully
7. **Test in both themes** (light and dark)
8. **Make it responsive** using grid layouts

## Troubleshooting

### Charts not rendering?
- Ensure `recharts` is installed
- Check that data is in correct format
- Verify component is client-side ('use client')

### Colors not showing?
- Ensure CSS custom properties are defined
- Check theme provider is wrapping your app
- Verify color values are valid CSS colors

### Loading state stuck?
- Check that loading prop is being updated
- Verify data fetching is completing
- Check for errors in console

## Example Files

See these files for complete examples:
- `components/dashboard/dashboard-example.tsx` - Full usage examples
- `app/(dashboard)/dashboard/page.tsx` - Real implementation
- `components/dashboard/README.md` - Detailed documentation

## Support

For more information, refer to:
- Component README: `components/dashboard/README.md`
- Design System: `lib/design-system/README.md`
- Thai Labels: `lib/constants/thai-labels.ts`
