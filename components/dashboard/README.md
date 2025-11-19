# Dashboard Components

Enterprise-grade dashboard components for displaying key metrics and data visualizations.

## Components

### StatCard

Display key metrics with optional trend indicators.

**Features:**
- Large number display with Thai locale formatting
- Icon support with color coding
- Trend indicator (up/down arrow with percentage)
- Loading skeleton state
- Subtle background and border styling
- Hover effects

**Usage:**
```tsx
import { StatCard } from '@/components/dashboard/stat-card';

<StatCard
  title="คำขอรออนุมัติ"
  value={42}
  icon="⏳"
  color="#f59e0b"
  trend={{ value: 12, direction: 'up' }}
  loading={false}
/>
```

**Props:**
- `title` (string): Card title
- `value` (number | string): Main metric value
- `icon` (ReactNode): Icon to display
- `trend` (optional): Trend data with value and direction
- `color` (optional): Custom color (defaults to primary)
- `loading` (optional): Show skeleton loader
- `className` (optional): Additional CSS classes

---

### LineChart

Display trend data over time using a line chart.

**Features:**
- Multiple line support
- Responsive sizing
- Interactive tooltips
- Legend
- Loading state
- Empty state handling
- Theme-aware colors

**Usage:**
```tsx
import { LineChart } from '@/components/dashboard/line-chart';

const data = [
  { month: 'ม.ค.', requisitions: 15, issued: 12 },
  { month: 'ก.พ.', requisitions: 20, issued: 18 },
  // ...
];

<LineChart
  data={data}
  xAxisKey="month"
  lines={[
    { dataKey: 'requisitions', name: 'คำขอทั้งหมด', color: '#3b82f6' },
    { dataKey: 'issued', name: 'จ่ายแล้ว', color: '#10b981' },
  ]}
  height={300}
  loading={false}
/>
```

**Props:**
- `data` (Array): Chart data
- `xAxisKey` (string): Key for X-axis values
- `lines` (Array): Line configurations with dataKey, name, and color
- `loading` (optional): Show skeleton loader
- `height` (optional): Chart height in pixels (default: 300)
- `className` (optional): Additional CSS classes

---

### BarChart

Display comparison data using a bar chart.

**Features:**
- Multiple bar support
- Responsive sizing
- Interactive tooltips
- Legend
- Loading state
- Empty state handling
- Rounded bar corners
- Theme-aware colors

**Usage:**
```tsx
import { BarChart } from '@/components/dashboard/bar-chart';

const data = [
  { category: 'อิเล็กทรอนิกส์', count: 25 },
  { category: 'เครื่องเขียน', count: 18 },
  // ...
];

<BarChart
  data={data}
  xAxisKey="category"
  bars={[
    { dataKey: 'count', name: 'จำนวน', color: '#3b82f6' },
  ]}
  height={300}
  loading={false}
/>
```

**Props:**
- `data` (Array): Chart data
- `xAxisKey` (string): Key for X-axis values
- `bars` (Array): Bar configurations with dataKey, name, and color
- `loading` (optional): Show skeleton loader
- `height` (optional): Chart height in pixels (default: 300)
- `className` (optional): Additional CSS classes

---

### DonutChart

Display distribution data using a donut chart.

**Features:**
- Percentage labels on slices
- Custom colors per slice
- Responsive sizing
- Interactive tooltips
- Legend
- Loading state
- Empty state handling
- Theme-aware default colors

**Usage:**
```tsx
import { DonutChart } from '@/components/dashboard/donut-chart';

const data = [
  { name: 'รออนุมัติ', value: 10, color: '#f59e0b' },
  { name: 'อนุมัติแล้ว', value: 25, color: '#10b981' },
  { name: 'จ่ายแล้ว', value: 30, color: '#3b82f6' },
  { name: 'ปฏิเสธ', value: 5, color: '#ef4444' },
];

<DonutChart
  data={data}
  height={300}
  loading={false}
/>
```

**Props:**
- `data` (Array): Chart data with name, value, and optional color
- `loading` (optional): Show skeleton loader
- `height` (optional): Chart height in pixels (default: 300)
- `className` (optional): Additional CSS classes

---

## Dashboard Page Layout

The dashboard page is organized into logical sections:

1. **Page Header**: Title and description with auto-refresh indicator
2. **Key Metrics**: 4 stat cards showing critical metrics
3. **Charts**: Line chart for trends and donut chart for distribution
4. **Status Breakdown**: Detailed status metrics
5. **Quick Links**: Navigation shortcuts

### Auto-Refresh

The dashboard automatically refreshes data every 30 seconds to ensure users always see the latest information.

### Responsive Design

- **Mobile (< 768px)**: Single column layout
- **Tablet (768-1023px)**: 2-column grid for stat cards
- **Desktop (1024px+)**: 4-column grid for stat cards, 2-column for charts

### Loading States

All components show skeleton loaders during data fetching to provide better perceived performance.

### Empty States

Charts display a friendly "ไม่มีข้อมูล" message when no data is available.

---

## Theme Support

All dashboard components support both light and dark themes using CSS custom properties:

- `--color-surface`: Card backgrounds
- `--color-border`: Card borders
- `--color-text`: Primary text
- `--color-text-secondary`: Secondary text
- `--color-primary`, `--color-success`, `--color-warning`, `--color-error`: Status colors

---

## Dependencies

- **recharts**: Chart library for data visualization
- **react**: Core React library
- **@/components/ui/skeleton**: Skeleton loader component

---

## Best Practices

1. **Always provide loading states** to improve perceived performance
2. **Use meaningful colors** that align with the data being displayed
3. **Keep metric titles concise** for better readability
4. **Format numbers** using Thai locale for consistency
5. **Group related metrics** into logical sections
6. **Provide context** with section headings and descriptions

---

## Accessibility

- All charts include proper ARIA labels
- Color is not the only indicator (text labels included)
- Keyboard navigation supported
- Screen reader friendly
- Sufficient color contrast in both themes

---

## Performance

- Components use React.memo where appropriate
- Charts are responsive and performant
- Auto-refresh uses cleanup to prevent memory leaks
- Skeleton loaders reduce perceived loading time
