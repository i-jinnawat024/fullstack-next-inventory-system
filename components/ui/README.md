# UI Component Library

Enterprise-grade UI components for the Inventory Requisition System.

## Components

### Button

Enhanced button component with multiple variants, sizes, and loading states.

**Features:**
- Variants: primary, secondary, tertiary, danger
- Sizes: sm, md, lg
- Loading state with spinner
- Icon support (left/right positioning)
- Keyboard navigation support
- Full width option

**Usage:**
```tsx
import { Button } from '@/components/ui';

// Basic button
<Button>Click me</Button>

// With variant and size
<Button variant="secondary" size="lg">Large Secondary</Button>

// With loading state
<Button loading>Saving...</Button>

// With icon
<Button icon={<PlusIcon />} iconPosition="left">Add Item</Button>

// Full width
<Button fullWidth>Submit</Button>
```

### StatusBadge

Color-coded status badges with Thai language labels and icons.

**Features:**
- Status types: pending, approved, rejected, issued, cancelled, draft
- Sizes: sm, md, lg
- Built-in icons for each status
- Custom icon support
- Proper ARIA labels

**Usage:**
```tsx
import { StatusBadge } from '@/components/ui';

// Basic status badge
<StatusBadge status="pending" />

// Different sizes
<StatusBadge status="approved" size="lg" />

// Custom icon
<StatusBadge status="issued" icon={<CustomIcon />} />
```

### Loading Components

#### Spinner
Simple loading spinner for buttons and small areas.

```tsx
import { Spinner } from '@/components/ui';

<Spinner size="md" />
```

#### Skeleton
Skeleton loaders that match content structure.

```tsx
import { Skeleton, SkeletonText, SkeletonCard, SkeletonTable } from '@/components/ui';

// Basic skeleton
<Skeleton className="h-10 w-full" />

// Text skeleton
<SkeletonText lines={3} />

// Card skeleton
<SkeletonCard />

// Table skeleton
<SkeletonTable rows={5} columns={4} />
```

#### ProgressBar
Progress indicators for file uploads and long operations.

```tsx
import { ProgressBar, CircularProgress } from '@/components/ui';

// Linear progress bar
<ProgressBar value={60} showLabel />

// With label
<ProgressBar value={75} label="Uploading..." showLabel />

// Different variants
<ProgressBar value={100} variant="success" />

// Circular progress
<CircularProgress value={45} />
```

#### OverlayLoader
Full-page loading overlay.

```tsx
import { OverlayLoader } from '@/components/ui';

<OverlayLoader message="กำลังโหลดข้อมูล..." />
```

## Error Handling Components

Comprehensive error handling system with user-friendly error states and boundaries.

**Components:**
- `InlineError`: Form field validation errors
- `EmptyState`: No data scenarios
- `ErrorState`: Data fetching errors with retry
- `ErrorBoundary`: Component error catching
- `SectionErrorBoundary`: Section-level error handling

**See [ERROR_HANDLING_README.md](./ERROR_HANDLING_README.md) for detailed documentation.**

**Quick Example:**
```tsx
import { ErrorState, EmptyState, InlineError } from '@/components/ui';

// Form validation
<InlineError message="กรุณากรอกข้อมูล" />

// Empty data
<EmptyState
  title="ไม่มีข้อมูล"
  description="ยังไม่มีรายการในระบบ"
/>

// Error with retry
<ErrorState
  variant="card"
  message="ไม่สามารถโหลดข้อมูลได้"
  onRetry={() => refetch()}
/>
```

## Design Tokens

All components use CSS custom properties (design tokens) for consistent theming:

- `--color-primary`: Primary brand color
- `--color-surface`: Surface/background color
- `--color-text`: Text color
- `--color-border`: Border color
- `--color-error`: Error/danger color
- `--color-success`: Success color
- `--color-warning`: Warning color
- `--color-info`: Info color

## Accessibility

All components follow WCAG 2.1 AA standards:

- Keyboard navigation support
- Proper ARIA labels and roles
- Focus indicators
- Screen reader support
- Color contrast compliance

## Theme Support

All components support both light and dark themes automatically through CSS custom properties.
