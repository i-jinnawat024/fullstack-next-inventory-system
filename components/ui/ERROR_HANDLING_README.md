# Error Handling System

A comprehensive error handling system for the Inventory Requisition System with user-friendly error states, error boundaries, and error logging.

## Components

### 1. InlineError
Displays error messages below form fields for validation errors.

```tsx
import { InlineError } from '@/components/ui/inline-error';

<InlineError message="กรุณากรอกข้อมูล" />
```

**Props:**
- `message` (string, required): Error message to display
- `className` (string, optional): Additional CSS classes

**Use Cases:**
- Form field validation errors
- Input-specific error messages
- Real-time validation feedback

---

### 2. EmptyState
Displays a friendly message when there's no data to show.

```tsx
import { EmptyState } from '@/components/ui/empty-state';
import { Package } from 'lucide-react';

<EmptyState
  icon={<Package className="w-12 h-12" />}
  title="ไม่มีสินค้า"
  description="ยังไม่มีสินค้าในระบบ กรุณาเพิ่มสินค้าใหม่"
  action={{
    label: 'เพิ่มสินค้า',
    onClick: () => router.push('/admin/products/new')
  }}
/>
```

**Props:**
- `icon` (ReactNode, optional): Icon to display
- `title` (string, required): Main heading
- `description` (string, optional): Descriptive text
- `action` (object, optional): Action button configuration
  - `label` (string): Button text
  - `onClick` (function): Click handler
- `className` (string, optional): Additional CSS classes

**Use Cases:**
- Empty tables
- No search results
- Empty lists
- First-time user experience

---

### 3. ErrorState
Displays error messages with retry functionality in different variants.

```tsx
import { ErrorState } from '@/components/ui/error-state';

// Inline variant (for small sections)
<ErrorState
  variant="inline"
  message="ไม่สามารถโหลดข้อมูลได้"
  onRetry={() => refetch()}
/>

// Card variant (for content areas)
<ErrorState
  variant="card"
  title="เกิดข้อผิดพลาด"
  message="ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง"
  onRetry={() => refetch()}
/>

// Page variant (for full-page errors)
<ErrorState
  variant="page"
  title="เกิดข้อผิดพลาด"
  message="ไม่สามารถโหลดหน้านี้ได้ กรุณาลองใหม่อีกครั้ง"
  onRetry={() => window.location.reload()}
/>
```

**Props:**
- `title` (string, optional): Error title (default: "เกิดข้อผิดพลาด")
- `message` (string, required): Error message
- `icon` (ReactNode, optional): Custom icon
- `onRetry` (function, optional): Retry handler
- `retryLabel` (string, optional): Retry button text (default: "ลองอีกครั้ง")
- `variant` ('inline' | 'card' | 'page', optional): Display variant (default: 'inline')
- `className` (string, optional): Additional CSS classes

**Use Cases:**
- API fetch errors
- Data loading failures
- Network errors
- Component rendering errors

---

### 4. ErrorBoundary
React error boundary for catching component errors with enhanced logging.

```tsx
import { ErrorBoundary } from '@/components/ui/error-boundary';

<ErrorBoundary
  onError={(error, errorInfo) => {
    // Custom error handling
    console.log('Error caught:', error);
  }}
  resetKeys={[userId]} // Reset when userId changes
>
  <YourComponent />
</ErrorBoundary>
```

**Props:**
- `children` (ReactNode, required): Child components to wrap
- `fallback` (ReactNode, optional): Custom fallback UI
- `onError` (function, optional): Custom error handler
- `resetKeys` (array, optional): Keys that trigger error reset when changed

**Features:**
- Catches React component errors
- Logs errors to console and error service
- Displays user-friendly fallback UI
- Shows error details in development mode
- Provides reset, reload, and go home actions
- Supports custom error handlers
- Auto-resets when resetKeys change

**Use Cases:**
- Wrapping entire application
- Protecting critical sections
- Catching unexpected component errors

---

### 5. SectionErrorBoundary
Lightweight error boundary for specific sections with inline error display.

```tsx
import { SectionErrorBoundary } from '@/components/ui/section-error-boundary';

<SectionErrorBoundary
  sectionName="Dashboard Stats"
  onReset={() => refetchStats()}
>
  <DashboardStats />
</SectionErrorBoundary>
```

**Props:**
- `children` (ReactNode, required): Child components to wrap
- `fallback` (ReactNode, optional): Custom fallback UI
- `sectionName` (string, optional): Section name for logging
- `onReset` (function, optional): Reset handler

**Features:**
- Displays inline error state (card variant)
- Logs errors with section context
- Provides retry functionality
- Doesn't break entire page

**Use Cases:**
- Dashboard widgets
- Data tables
- Chart components
- Independent sections

---

## Error Pages

### 404 Not Found
Located at `app/not-found.tsx`

**Features:**
- Displays 404 error with icon
- Thai language messages
- Link to home page
- Theme-aware styling

### 500 Internal Server Error
Located at `app/500.tsx`

**Features:**
- Displays 500 error with icon
- Thai language messages
- Reload and home page actions
- Theme-aware styling

### Global Error Handler
Located at `app/error.tsx`

**Features:**
- Catches page-level errors
- Displays error details in development
- Provides retry and home actions
- Theme-aware styling

---

## Error Logging

### ErrorLogger Utility
Centralized error logging with support for external services.

```tsx
import { logError, logComponentError, logApiError } from '@/lib/utils/error-logger';

// Log general error
try {
  // code
} catch (error) {
  logError(error as Error, { context: 'user-action' });
}

// Log component error (used in error boundaries)
logComponentError(error, errorInfo, { section: 'Dashboard' });

// Log API error
logApiError('/api/products', 'GET', 500, 'Internal Server Error', {
  userId: user.id
});
```

**Features:**
- Centralized error logging
- Stores errors in memory (development)
- Logs to console
- Ready for integration with error tracking services (Sentry, LogRocket)
- Captures context and metadata
- Separate methods for different error types

**Integration Points:**
- Error boundaries
- API error handlers
- Try-catch blocks
- Promise rejections

---

## Usage Patterns

### Form Validation Errors
```tsx
import { InlineError } from '@/components/ui/inline-error';

<div>
  <label>ชื่อสินค้า</label>
  <TextInput
    value={name}
    onChange={(e) => setName(e.target.value)}
    error={!!errors.name}
  />
  {errors.name && <InlineError message={errors.name} />}
</div>
```

### Data Fetching with Error Handling
```tsx
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';

function ProductList() {
  const { data, error, isLoading, refetch } = useQuery('products');

  if (isLoading) return <Skeleton />;
  
  if (error) {
    return (
      <ErrorState
        variant="card"
        message="ไม่สามารถโหลดรายการสินค้าได้"
        onRetry={refetch}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<Package className="w-12 h-12" />}
        title="ไม่มีสินค้า"
        description="ยังไม่มีสินค้าในระบบ"
      />
    );
  }

  return <DataTable data={data} />;
}
```

### Protected Sections
```tsx
import { SectionErrorBoundary } from '@/components/ui/section-error-boundary';

function Dashboard() {
  return (
    <div>
      <SectionErrorBoundary sectionName="Stats">
        <DashboardStats />
      </SectionErrorBoundary>

      <SectionErrorBoundary sectionName="Charts">
        <DashboardCharts />
      </SectionErrorBoundary>

      <SectionErrorBoundary sectionName="Recent Activity">
        <RecentActivity />
      </SectionErrorBoundary>
    </div>
  );
}
```

### API Error Handling
```tsx
import { logApiError } from '@/lib/utils/error-logger';
import { useNotification } from '@/lib/contexts/notification-context';

async function deleteProduct(id: string) {
  const { showError } = useNotification();
  
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      logApiError(`/api/products/${id}`, 'DELETE', response.status, error.message);
      showError('ลบสินค้าไม่สำเร็จ', error.message);
      return;
    }

    showSuccess('ลบสินค้าสำเร็จ');
  } catch (error) {
    logError(error as Error, { action: 'delete-product', productId: id });
    showError('เกิดข้อผิดพลาด', 'ไม่สามารถลบสินค้าได้');
  }
}
```

---

## Best Practices

1. **Use appropriate error components for context:**
   - `InlineError` for form validation
   - `EmptyState` for no data scenarios
   - `ErrorState` for data fetching errors
   - `ErrorBoundary` for component errors
   - `SectionErrorBoundary` for independent sections

2. **Always provide retry functionality:**
   - Include `onRetry` prop when possible
   - Allow users to recover from errors
   - Clear error state after successful retry

3. **Use Thai language for all user-facing messages:**
   - Import from `THAI_LABELS` constant
   - Keep messages clear and actionable
   - Avoid technical jargon

4. **Log errors appropriately:**
   - Use error logger for all errors
   - Include relevant context
   - Don't expose sensitive information

5. **Test error states:**
   - Test error boundaries
   - Test error recovery
   - Test empty states
   - Test form validation

6. **Provide context in error messages:**
   - Be specific about what went wrong
   - Suggest next steps
   - Include retry options

---

## Accessibility

All error components follow accessibility best practices:

- Use `role="alert"` for error messages
- Include `aria-live="polite"` for dynamic errors
- Provide `aria-label` for icons
- Ensure keyboard navigation works
- Maintain color contrast ratios
- Support screen readers

---

## Theme Support

All error components support both light and dark themes using CSS custom properties:

- `--color-error`: Error color
- `--color-text`: Text color
- `--color-text-secondary`: Secondary text color
- `--color-surface`: Surface background
- `--color-surface-hover`: Hover background
- `--color-border`: Border color

---

## Future Enhancements

- Integration with Sentry or LogRocket
- Error analytics dashboard
- User feedback collection
- Automatic error recovery
- Offline error handling
- Error rate monitoring
