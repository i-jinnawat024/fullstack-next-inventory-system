# Loading States Guide

This document describes all loading state components and patterns used in the application.

## Loading Components

### 1. Spinner

Basic loading spinner for inline use:

```tsx
import { Spinner } from '@/components/ui/loading-spinner';

<Spinner size="sm" />  // Small (16px)
<Spinner size="md" />  // Medium (32px)
<Spinner size="lg" />  // Large (48px)
```

### 2. LoadingSpinner

Centered spinner with container:

```tsx
import { LoadingSpinner } from '@/components/ui/loading-spinner';

<LoadingSpinner size="md" />
```

### 3. LoadingPage

Full-page loading state:

```tsx
import { LoadingPage } from '@/components/ui/loading-spinner';

// In loading.tsx
export default function Loading() {
  return <LoadingPage />;
}
```

### 4. OverlayLoader

Loading overlay for modal/section loading:

```tsx
import { OverlayLoader } from '@/components/ui/loading-spinner';

<div className="relative">
  {/* Content */}
  {loading && <OverlayLoader message="กำลังโหลด..." />}
</div>
```

### 5. Skeleton Loaders

Content placeholder loaders:

```tsx
import { Skeleton, SkeletonText, SkeletonCard, SkeletonTable } from '@/components/ui/skeleton';

// Basic skeleton
<Skeleton variant="rectangular" width={200} height={100} />
<Skeleton variant="circular" width={48} height={48} />
<Skeleton variant="text" className="h-4 w-full" />

// Preset skeletons
<SkeletonText lines={3} />
<SkeletonCard />
<SkeletonTable rows={5} columns={4} />
```

### 6. Progress Bars

For operations with known progress:

```tsx
import { ProgressBar, CircularProgress } from '@/components/ui/progress-bar';

// Linear progress
<ProgressBar 
  value={progress} 
  max={100}
  variant="success"
  showLabel={true}
  label="Uploading..."
/>

// Circular progress
<CircularProgress 
  value={progress}
  size={64}
  variant="default"
  showLabel={true}
/>
```

## Loading Patterns

### Pattern 1: Button Loading State

```tsx
import { Button } from '@/components/ui/button';

<Button 
  loading={isSubmitting}
  disabled={isSubmitting}
  onClick={handleSubmit}
>
  บันทึก
</Button>
```

**Features:**
- Shows spinner icon
- Disables button
- Maintains button width
- Accessible with aria-busy

### Pattern 2: Data Fetching with Skeleton

```tsx
function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <SkeletonCard />;
  }

  return <DataDisplay data={data} />;
}
```

### Pattern 3: Table Loading

```tsx
import { DataTable } from '@/components/tables/data-table';

<DataTable
  data={data}
  columns={columns}
  loading={isLoading}  // Shows skeleton table
/>
```

### Pattern 4: Chart Loading

```tsx
import { LineChart } from '@/components/dashboard/line-chart';

<LineChart
  data={chartData}
  xAxisKey="month"
  lines={lines}
  loading={isLoading}  // Shows skeleton chart
/>
```

### Pattern 5: Form Submission

```tsx
function MyForm() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await submitForm(formData);
      showSuccess('บันทึกสำเร็จ');
    } catch (error) {
      showError('เกิดข้อผิดพลาด');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" loading={submitting}>
        บันทึก
      </Button>
    </form>
  );
}
```

### Pattern 6: Page-Level Loading

```tsx
// app/(dashboard)/my-page/loading.tsx
import { LoadingPage } from '@/components/ui/loading-spinner';

export default function Loading() {
  return <LoadingPage />;
}
```

### Pattern 7: Section Loading

```tsx
function DashboardSection() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <div className="p-6 rounded-lg border">
        <SkeletonText lines={1} className="mb-4" />
        <SkeletonTable rows={3} columns={3} />
      </div>
    );
  }

  return <ActualContent />;
}
```

### Pattern 8: Infinite Scroll Loading

```tsx
function InfiniteList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    const newItems = await fetchMoreItems();
    setItems([...items, ...newItems]);
    setHasMore(newItems.length > 0);
    setLoading(false);
  };

  return (
    <div>
      {items.map(item => <Item key={item.id} {...item} />)}
      {loading && <LoadingSpinner />}
      {hasMore && !loading && (
        <Button onClick={loadMore}>โหลดเพิ่มเติม</Button>
      )}
    </div>
  );
}
```

## Custom Hooks

### useLoadingState

Manage multiple loading states:

```tsx
import { useLoadingState } from '@/lib/hooks/use-loading-state';

function MyComponent() {
  const { setLoading, isLoading, isAnyLoading } = useLoadingState();

  const handleAction1 = async () => {
    setLoading('action1', true);
    await doAction1();
    setLoading('action1', false);
  };

  const handleAction2 = async () => {
    setLoading('action2', true);
    await doAction2();
    setLoading('action2', false);
  };

  return (
    <div>
      <Button loading={isLoading('action1')} onClick={handleAction1}>
        Action 1
      </Button>
      <Button loading={isLoading('action2')} onClick={handleAction2}>
        Action 2
      </Button>
      {isAnyLoading() && <OverlayLoader />}
    </div>
  );
}
```

### useAsyncOperation

Manage async operations with loading state:

```tsx
import { useAsyncOperation } from '@/lib/hooks/use-loading-state';

function MyComponent() {
  const { loading, error, data, execute } = useAsyncOperation();

  const handleFetch = () => {
    execute(async () => {
      const response = await fetch('/api/data');
      return response.json();
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <EmptyState />;

  return <DataDisplay data={data} />;
}
```

## Best Practices

### 1. Always Show Loading State

✅ **Do:**
```tsx
{loading ? <Skeleton /> : <Content />}
```

❌ **Don't:**
```tsx
{/* No loading state - content just appears */}
{data && <Content />}
```

### 2. Match Skeleton to Content

✅ **Do:**
```tsx
// Skeleton matches actual content structure
{loading ? (
  <div className="grid grid-cols-3 gap-4">
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </div>
) : (
  <div className="grid grid-cols-3 gap-4">
    {items.map(item => <Card key={item.id} {...item} />)}
  </div>
)}
```

❌ **Don't:**
```tsx
// Generic spinner doesn't match layout
{loading ? <Spinner /> : <ComplexGrid />}
```

### 3. Disable Actions During Loading

✅ **Do:**
```tsx
<Button loading={submitting} disabled={submitting}>
  Submit
</Button>
```

❌ **Don't:**
```tsx
<Button onClick={handleSubmit}>
  {submitting ? 'Loading...' : 'Submit'}
</Button>
```

### 4. Provide Feedback for Long Operations

✅ **Do:**
```tsx
<ProgressBar 
  value={uploadProgress}
  label="Uploading file..."
  showLabel={true}
/>
```

❌ **Don't:**
```tsx
{/* No progress indication for long upload */}
<Spinner />
```

### 5. Use Appropriate Loading Component

| Use Case | Component |
|----------|-----------|
| Button action | `<Button loading={true}>` |
| Data fetching | `<Skeleton>` |
| Page load | `<LoadingPage>` |
| Modal/overlay | `<OverlayLoader>` |
| File upload | `<ProgressBar>` |
| Table data | `<DataTable loading={true}>` |
| Chart data | `<LineChart loading={true}>` |

### 6. Optimize Loading Experience

```tsx
// Show skeleton immediately, no delay
const [loading, setLoading] = useState(true);

// For very fast operations, add minimum display time
const [loading, setLoading] = useState(true);

useEffect(() => {
  const minLoadTime = 300; // ms
  const startTime = Date.now();
  
  fetchData().then(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minLoadTime - elapsed);
    
    setTimeout(() => setLoading(false), remaining);
  });
}, []);
```

## Accessibility

All loading components include:
- `role="status"` or `role="progressbar"`
- `aria-label` or `aria-labelledby`
- `aria-busy` on loading elements
- Screen reader text with `.sr-only`

```tsx
<div role="status" aria-label="กำลังโหลด">
  <Spinner />
  <span className="sr-only">กำลังโหลด</span>
</div>
```

## Performance Considerations

1. **Skeleton Loaders**: Preferred over spinners for better perceived performance
2. **Progressive Loading**: Load critical content first, then secondary content
3. **Optimistic Updates**: Update UI immediately, sync in background
4. **Debounce**: Prevent loading flicker for fast operations

```tsx
// Debounce loading state to prevent flicker
const [showLoading, setShowLoading] = useState(false);

useEffect(() => {
  const timer = setTimeout(() => {
    if (loading) setShowLoading(true);
  }, 200); // Only show loading after 200ms

  return () => clearTimeout(timer);
}, [loading]);

if (showLoading) return <Skeleton />;
```

## Checklist

Before deploying:

- [ ] All data fetching shows loading state
- [ ] All buttons show loading during actions
- [ ] All forms disable during submission
- [ ] All tables have loading skeletons
- [ ] All charts have loading skeletons
- [ ] Page-level loading.tsx files exist
- [ ] Long operations show progress
- [ ] Loading states are accessible
- [ ] No loading flicker on fast operations
- [ ] Skeleton loaders match content structure
