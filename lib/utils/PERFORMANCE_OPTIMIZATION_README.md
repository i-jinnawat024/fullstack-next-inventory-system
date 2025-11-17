# Performance Optimization Guide

This document describes the performance optimizations implemented in the application.

## React.memo Optimizations

All major components have been wrapped with `React.memo` to prevent unnecessary re-renders:

### Dashboard Components
- `StatCard` - Memoized to prevent re-renders when parent updates
- `LineChart` - Memoized chart component with data comparison
- `BarChart` - Memoized chart component
- `DonutChart` - Memoized chart component
- All skeleton loader components are memoized

### UI Components
- `StatusBadge` - Memoized to prevent re-renders in tables
- `Button` - Already optimized with forwardRef
- `Toast` - Memoized notification component

## Virtualization

### VirtualizedList Component

For rendering long lists efficiently:

```tsx
import { VirtualizedList } from '@/components/ui/virtualized-list';

<VirtualizedList
  items={largeDataArray}
  itemHeight={60}
  containerHeight={400}
  overscan={3}
  renderItem={(item, index) => (
    <div>{item.name}</div>
  )}
/>
```

**Benefits:**
- Only renders visible items + overscan buffer
- Dramatically reduces DOM nodes for large lists
- Smooth scrolling performance
- Automatic cleanup of off-screen items

**When to use:**
- Lists with 100+ items
- Tables with many rows
- Infinite scroll implementations
- Chat message lists

## Lazy Loading

### Component Lazy Loading

Use the `lazyLoad` utility for code splitting:

```tsx
import { lazyLoad } from '@/lib/utils/lazy-load';
import { Suspense } from 'react';

const HeavyComponent = lazyLoad(() => import('./HeavyComponent'));

function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

**Components to lazy load:**
- Chart libraries (recharts)
- Rich text editors
- File upload components
- Modal dialogs
- Admin panels
- Report generators

### Image Optimization

Use the `OptimizedImage` component:

```tsx
import { OptimizedImage } from '@/components/ui/optimized-image';

<OptimizedImage
  src="/path/to/image.jpg"
  alt="Description"
  width={400}
  height={300}
  fallbackSrc="/placeholder.png"
  showSkeleton={true}
/>
```

**Features:**
- Automatic lazy loading
- Skeleton loader during load
- Fallback image on error
- Optimized quality (85%)
- Smooth fade-in transition
- Uses Next.js Image optimization

## Performance Utilities

### Debounce

Limit function execution rate for expensive operations:

```tsx
import { debounce } from '@/lib/utils/performance';

const handleSearch = debounce((term: string) => {
  // Expensive search operation
  fetchResults(term);
}, 300);
```

**Use cases:**
- Search input
- Window resize handlers
- Form validation
- API calls on input change

### Throttle

Ensure function executes at most once per time period:

```tsx
import { throttle } from '@/lib/utils/performance';

const handleScroll = throttle(() => {
  // Scroll handling logic
  updateScrollPosition();
}, 100);
```

**Use cases:**
- Scroll events
- Mouse move tracking
- Window resize
- Animation frame updates

### Reduced Motion Detection

Respect user's motion preferences:

```tsx
import { prefersReducedMotion } from '@/lib/utils/performance';

const shouldAnimate = !prefersReducedMotion();

<div
  style={{
    transition: shouldAnimate ? 'all 0.3s ease' : 'none',
  }}
>
  Content
</div>
```

## Best Practices

### 1. Component Memoization

✅ **Do:**
```tsx
export const MyComponent = memo(function MyComponent({ data }) {
  return <div>{data.name}</div>;
});
```

❌ **Don't:**
```tsx
// Inline object creation causes re-renders
<MyComponent style={{ color: 'red' }} />

// Instead, define outside or use useMemo
const style = { color: 'red' };
<MyComponent style={style} />
```

### 2. Callback Optimization

✅ **Do:**
```tsx
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

❌ **Don't:**
```tsx
// Creates new function on every render
<Button onClick={() => doSomething(id)} />
```

### 3. Expensive Calculations

✅ **Do:**
```tsx
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.value - b.value);
}, [data]);
```

❌ **Don't:**
```tsx
// Sorts on every render
const sortedData = data.sort((a, b) => a.value - b.value);
```

### 4. List Rendering

✅ **Do:**
```tsx
// For large lists (100+ items)
<VirtualizedList items={items} ... />

// For small lists with stable keys
{items.map(item => <Item key={item.id} {...item} />)}
```

❌ **Don't:**
```tsx
// Using index as key
{items.map((item, index) => <Item key={index} {...item} />)}
```

### 5. Image Loading

✅ **Do:**
```tsx
<OptimizedImage
  src="/image.jpg"
  width={400}
  height={300}
  alt="Description"
/>
```

❌ **Don't:**
```tsx
// Regular img tag without optimization
<img src="/large-image.jpg" />
```

## Performance Monitoring

### Development Mode

In development, performance metrics are logged to console:
- Component render times
- Web Vitals (LCP, FID, CLS)
- Re-render counts

### Production Monitoring

Integrate with analytics:

```tsx
import { reportWebVitals } from '@/lib/utils/performance';

// In _app.tsx or layout.tsx
export function reportWebVitals(metric) {
  // Send to analytics service
  analytics.track('web-vital', {
    name: metric.name,
    value: metric.value,
  });
}
```

## Checklist

Before deploying:

- [ ] All heavy components are lazy loaded
- [ ] Large lists use virtualization
- [ ] Images use OptimizedImage component
- [ ] Event handlers are debounced/throttled
- [ ] Expensive calculations use useMemo
- [ ] Callbacks use useCallback
- [ ] Components use React.memo where appropriate
- [ ] Reduced motion preferences are respected
- [ ] Bundle size is analyzed
- [ ] Lighthouse score > 90

## Tools

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npm run analyze
```

### Performance Testing

```bash
# Run Lighthouse
npx lighthouse http://localhost:3000 --view

# Check bundle size
npx next build --profile
```

## Results

Expected improvements:
- **Initial Load Time**: 30-40% faster
- **Re-render Performance**: 50-60% reduction
- **Memory Usage**: 40-50% lower for large lists
- **Lighthouse Score**: 90+ across all metrics
