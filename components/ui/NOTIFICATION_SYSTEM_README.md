# Notification System

A comprehensive toast notification system for displaying feedback to users with support for success, error, warning, and info messages.

## Features

- ✅ Four notification types: success, error, warning, info
- ✅ Auto-dismiss after 5 seconds (configurable)
- ✅ Manual dismiss button
- ✅ Toast stacking (vertical layout)
- ✅ Positioned at top-right corner
- ✅ Smooth animations
- ✅ Accessible with ARIA live regions
- ✅ Theme-aware (light/dark mode support)
- ✅ Thai language support

## Components

### Toast Component

Individual toast notification with icon, title, message, and close button.

```tsx
import { Toast } from '@/components/ui/toast';

<Toast
  id="unique-id"
  type="success"
  title="บันทึกสำเร็จ"
  message="ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว"
  duration={5000}
  onClose={(id) => console.log('Toast closed:', id)}
/>
```

### NotificationProvider

Context provider that manages notification state and renders toast container.

```tsx
import { NotificationProvider } from '@/lib/contexts/notification-context';

function App() {
  return (
    <NotificationProvider>
      {/* Your app content */}
    </NotificationProvider>
  );
}
```

## Usage

### Basic Usage

```tsx
'use client';

import { useNotification } from '@/lib/contexts/notification-context';

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  const handleSave = async () => {
    try {
      await saveData();
      showSuccess('บันทึกสำเร็จ', 'ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว');
    } catch (error) {
      showError('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  return (
    <button onClick={handleSave}>บันทึก</button>
  );
}
```

### With Form Validation

```tsx
'use client';

import { useNotification } from '@/lib/contexts/notification-context';
import { useFormValidation } from '@/lib/hooks/use-form-validation';

function MyForm() {
  const { showSuccess, showError } = useNotification();
  const { formState, validateForm, getValues } = useFormValidation(/* ... */);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    try {
      const values = getValues();
      await submitForm(values);
      showSuccess('ส่งข้อมูลสำเร็จ', 'ข้อมูลของคุณถูกส่งเรียบร้อยแล้ว');
    } catch (error) {
      showError('เกิดข้อผิดพลาด', 'ไม่สามารถส่งข้อมูลได้');
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

### With API Calls

```tsx
'use client';

import { useApiWithNotifications } from '@/lib/hooks/use-api-with-notifications';

function MyComponent() {
  const { callApi, isLoading } = useApiWithNotifications();

  const handleApprove = async (id: string) => {
    const result = await callApi(
      () => fetch(`/api/requisitions/${id}/approve`, { method: 'POST' }),
      {
        successMessage: 'อนุมัติคำขอสำเร็จ',
        errorMessage: 'ไม่สามารถอนุมัติคำขอได้',
        showLoadingNotification: true,
        loadingMessage: 'กำลังอนุมัติคำขอ...',
      }
    );

    if (result) {
      // Handle success
      console.log('Approved:', result);
    }
  };

  return (
    <button onClick={() => handleApprove('123')} disabled={isLoading}>
      อนุมัติ
    </button>
  );
}
```

### Custom Duration

```tsx
const { showSuccess } = useNotification();

// Show for 10 seconds
showSuccess('บันทึกสำเร็จ', 'ข้อมูลถูกบันทึกแล้ว', 10000);

// Show indefinitely (until manually closed)
showSuccess('บันทึกสำเร็จ', 'ข้อมูลถูกบันทึกแล้ว', 0);
```

## API Reference

### useNotification Hook

Returns notification functions for displaying toasts.

```typescript
interface NotificationContextType {
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, duration?: number) => void;
  showWarning: (title: string, message?: string, duration?: number) => void;
  showInfo: (title: string, message?: string, duration?: number) => void;
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}
```

### Toast Props

```typescript
interface ToastProps {
  id: string;                    // Unique identifier
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;                 // Main heading
  message?: string;              // Optional description
  duration?: number;             // Auto-dismiss duration in ms (default: 5000)
  onClose: (id: string) => void; // Callback when toast is closed
}
```

### useApiWithNotifications Hook

Hook for making API calls with automatic notification handling.

```typescript
interface ApiOptions {
  successMessage?: string;           // Message to show on success
  errorMessage?: string;             // Message to show on error
  showLoadingNotification?: boolean; // Show loading notification
  loadingMessage?: string;           // Custom loading message
}

function useApiWithNotifications() {
  return {
    callApi: <T>(apiCall: () => Promise<Response>, options?: ApiOptions) => Promise<T | null>;
    isLoading: boolean;
  };
}
```

## Notification Types

### Success (Green)
Use for successful operations like saving data, completing tasks, or confirming actions.

```tsx
showSuccess('บันทึกสำเร็จ', 'ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว');
```

### Error (Red)
Use for errors, failures, or when something goes wrong.

```tsx
showError('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
```

### Warning (Yellow)
Use for warnings, cautions, or important information that needs attention.

```tsx
showWarning('คำเตือน', 'สต็อกสินค้าใกล้หมด กรุณาเติมสต็อก');
```

### Info (Blue)
Use for informational messages, tips, or general notifications.

```tsx
showInfo('ข้อมูล', 'ระบบจะปิดปรับปรุงในวันที่ 1 มกราคม 2567');
```

## Styling

The notification system uses CSS custom properties from the design token system:

- `--color-success` / `--color-success-light`
- `--color-error` / `--color-error-light`
- `--color-warning` / `--color-warning-light`
- `--color-info` / `--color-info-light`

Colors automatically adapt to light/dark theme.

## Accessibility

- Uses ARIA `role="alert"` for screen reader announcements
- Uses `aria-live="polite"` for non-intrusive announcements
- Uses `aria-atomic="true"` to announce entire message
- Close button has proper `aria-label`
- Keyboard accessible (Tab to close button, Enter/Space to close)

## Best Practices

1. **Keep titles short**: Use concise titles (2-4 words)
2. **Provide context in message**: Add helpful details in the message
3. **Use appropriate types**: Match notification type to the situation
4. **Don't overuse**: Only show notifications for important events
5. **Set appropriate duration**: 
   - Quick actions: 3-5 seconds
   - Important info: 7-10 seconds
   - Critical errors: 0 (manual dismiss only)

## Examples

### Form Submission

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) {
    showError('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
    return;
  }

  showInfo('กำลังบันทึกข้อมูล...', 'กรุณารอสักครู่');

  try {
    await saveData();
    showSuccess('บันทึกสำเร็จ', 'ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว');
  } catch (error) {
    showError('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
  }
};
```

### Delete Confirmation

```tsx
const handleDelete = async (id: string) => {
  if (!confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) {
    return;
  }

  try {
    await deleteItem(id);
    showSuccess('ลบสำเร็จ', 'รายการถูกลบเรียบร้อยแล้ว');
  } catch (error) {
    showError('ลบไม่สำเร็จ', 'ไม่สามารถลบรายการได้');
  }
};
```

### Approval Workflow

```tsx
const handleApprove = async (requisitionId: string) => {
  const result = await callApi(
    () => fetch(`/api/requisitions/${requisitionId}/approve`, { method: 'POST' }),
    {
      successMessage: 'อนุมัติคำขอเบิกสินค้าสำเร็จ',
      errorMessage: 'ไม่สามารถอนุมัติคำขอได้',
    }
  );

  if (result) {
    // Refresh data or navigate
  }
};
```

## Integration with Existing Code

The notification system is already integrated into:

1. **Root Layout** (`app/layout.tsx`): NotificationProvider wraps the entire app
2. **Form Example** (`components/forms/form-example.tsx`): Shows form validation and submission notifications
3. **API Hook** (`lib/hooks/use-api-with-notifications.ts`): Automatic API error handling

To use in your components:

```tsx
'use client';

import { useNotification } from '@/lib/contexts/notification-context';

export function MyComponent() {
  const { showSuccess, showError } = useNotification();
  
  // Use notification functions
}
```

## Testing

The notification system can be tested by:

1. Triggering form submissions with validation errors
2. Making API calls that succeed or fail
3. Testing different notification types
4. Verifying auto-dismiss timing
5. Testing manual dismiss functionality
6. Checking accessibility with screen readers

## Browser Support

Works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance

- Lightweight: ~2KB gzipped
- No external dependencies
- Efficient re-renders with React context
- Smooth animations with CSS transitions
