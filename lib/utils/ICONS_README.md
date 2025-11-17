# Icon Library Documentation

## Overview

This application uses a centralized icon library to ensure consistent icon usage across all pages and components. All icons are SVG-based for scalability and theme compatibility.

## Usage

### Basic Usage

```tsx
import { Icons } from '@/lib/utils/icons';

// Use an icon
<Icons.Check className="w-5 h-5" aria-label="Approved" />
```

### With Predefined Sizes

```tsx
import { Icons, iconSizes } from '@/lib/utils/icons';

// Use predefined size
<Icons.User className={iconSizes.md} aria-label="User profile" />
```

### Available Sizes

- `xs`: 12px (w-3 h-3)
- `sm`: 16px (w-4 h-4)
- `md`: 20px (w-5 h-5) - Default
- `lg`: 24px (w-6 h-6)
- `xl`: 32px (w-8 h-8)
- `2xl`: 40px (w-10 h-10)

## Accessibility

All icons support proper ARIA attributes:

```tsx
// Decorative icon (hidden from screen readers)
<Icons.Check aria-hidden="true" />

// Meaningful icon (announced by screen readers)
<Icons.Check aria-label="Approved" />
```

## Available Icons

### Navigation Icons
- `Dashboard` - Dashboard/home icon
- `Menu` - Hamburger menu
- `Close` - Close/X icon
- `ChevronDown` - Dropdown indicator
- `ChevronRight` - Right arrow

### Status Icons
- `Check` - Checkmark
- `CheckCircle` - Checkmark in circle (success)
- `XCircle` - X in circle (error)
- `Clock` - Clock/pending
- `Warning` - Warning triangle

### Action Icons
- `Plus` - Add/create
- `Edit` - Edit/pencil
- `Trash` - Delete
- `Search` - Search
- `Filter` - Filter
- `Download` - Download
- `Upload` - Upload

### Document Icons
- `Document` - Generic document
- `DocumentText` - Text document
- `Clipboard` - Clipboard

### Inventory Icons
- `Package` - Package/box
- `Cube` - 3D cube
- `ShoppingCart` - Shopping cart

### User Icons
- `User` - Single user
- `Users` - Multiple users
- `UserCircle` - User in circle

### Chart Icons
- `ChartBar` - Bar chart
- `ChartPie` - Pie chart
- `TrendingUp` - Trending up arrow
- `TrendingDown` - Trending down arrow

### Settings Icons
- `Cog` - Settings gear

### Theme Icons
- `Sun` - Light mode
- `Moon` - Dark mode

### Notification Icons
- `Bell` - Notification bell

### Info Icons
- `InformationCircle` - Information
- `QuestionMarkCircle` - Help/question

### Arrow Icons
- `ArrowLeft` - Left arrow
- `ArrowRight` - Right arrow

### Loading Icon
- `Spinner` - Animated loading spinner

## Best Practices

### 1. Consistent Sizing

Use the predefined size constants for consistency:

```tsx
// Good
<Icons.User className={iconSizes.md} />

// Avoid
<Icons.User className="w-5 h-5" />
```

### 2. Proper ARIA Labels

Always provide ARIA labels for meaningful icons:

```tsx
// Good - Meaningful icon
<Icons.Check aria-label="Approved" />

// Good - Decorative icon
<Icons.Check aria-hidden="true" />

// Bad - No accessibility attribute
<Icons.Check />
```

### 3. Color Inheritance

Icons inherit the current text color. Use text color utilities:

```tsx
<div className="text-green-600">
  <Icons.Check className={iconSizes.md} />
</div>
```

### 4. Icon with Text

When pairing icons with text, use proper spacing:

```tsx
<button className="flex items-center gap-2">
  <Icons.Plus className={iconSizes.sm} aria-hidden="true" />
  <span>Add Item</span>
</button>
```

## Examples

### Button with Icon

```tsx
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/utils/icons';

<Button
  icon={<Icons.Plus />}
  iconPosition="left"
>
  Create New
</Button>
```

### Status Badge with Icon

```tsx
import { StatusBadge } from '@/components/ui/status-badge';
import { Icons } from '@/lib/utils/icons';

<StatusBadge
  status="approved"
  icon={<Icons.CheckCircle />}
/>
```

### Stat Card with Icon

```tsx
import { StatCard } from '@/components/dashboard/stat-card';
import { Icons } from '@/lib/utils/icons';

<StatCard
  title="Total Items"
  value={150}
  icon={<Icons.Package />}
  color="var(--color-primary)"
/>
```

## Migration Guide

When updating existing code to use the centralized icon library:

### Before
```tsx
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
</svg>
```

### After
```tsx
import { Icons, iconSizes } from '@/lib/utils/icons';

<Icons.Check className={iconSizes.md} aria-label="Success" />
```

## Adding New Icons

To add a new icon to the library:

1. Open `lib/utils/icons.tsx`
2. Add the icon to the `Icons` object:

```tsx
NewIcon: (props: IconProps) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="..." />
  </Icon>
),
```

3. Document the new icon in this README
4. Update the TypeScript types if needed

## Theme Compatibility

All icons automatically adapt to the current theme (light/dark mode) by using `currentColor`. No additional styling is needed for theme support.
