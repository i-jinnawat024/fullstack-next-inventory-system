# Enhanced Navigation System

This document describes the enhanced navigation system implemented for the enterprise UX/UI enhancement.

## Components

### 1. Sidebar (`sidebar.tsx`)

A collapsible sidebar navigation component with hierarchical menu structure.

**Features:**
- ✅ Persistent sidebar with hierarchical menu structure (Requirement 1.1)
- ✅ Active state highlighting for current page (Requirement 1.2)
- ✅ Icons and labels for each menu item (Requirement 1.3)
- ✅ Role-based menu filtering (Requirement 1.3)
- ✅ Hover tooltips for collapsed state (Requirement 1.2)
- ✅ Smooth collapse/expand animations (Requirement 1.5)
- ✅ Collapsible menu groups with expand/collapse
- ✅ User info section at bottom
- ✅ Collapse toggle button (desktop only)

**Props:**
```typescript
interface SidebarProps {
  user: AuthUser;           // Current user for role-based filtering
  collapsed?: boolean;      // Sidebar collapsed state
  onToggle?: () => void;    // Callback for collapse toggle
}
```

**Usage:**
```tsx
import { Sidebar } from '@/components/layout';

<Sidebar 
  user={currentUser} 
  collapsed={false}
  onToggle={() => setCollapsed(!collapsed)}
/>
```

### 2. MobileMenu (`mobile-menu.tsx`)

Mobile-responsive hamburger menu with overlay.

**Features:**
- ✅ Mobile-responsive (< 768px) (Requirement 1.5, 9.5)
- ✅ Overlay backdrop
- ✅ Smooth slide-in animation
- ✅ Close on backdrop click
- ✅ Close on Escape key
- ✅ Prevents body scroll when open

**Props:**
```typescript
interface MobileMenuProps {
  user: AuthUser;
  isOpen: boolean;
  onClose: () => void;
}
```

**Usage:**
```tsx
import { MobileMenu } from '@/components/layout';

<MobileMenu 
  user={currentUser}
  isOpen={mobileMenuOpen}
  onClose={() => setMobileMenuOpen(false)}
/>
```

### 3. Breadcrumbs (`breadcrumbs.tsx`)

Breadcrumb navigation showing page hierarchy.

**Features:**
- ✅ Shows page hierarchy (Requirement 1.4)
- ✅ Auto-generates from current route
- ✅ Clickable navigation items
- ✅ Truncation for long paths
- ✅ Proper spacing and separators
- ✅ Home icon link
- ✅ Thai language labels

**Props:**
```typescript
interface BreadcrumbsProps {
  items?: BreadcrumbItem[];  // Optional manual items
  maxItems?: number;         // Max items before truncation (default: 4)
}

interface BreadcrumbItem {
  label: string;
  href?: string;  // No href for current page
}
```

**Usage:**
```tsx
import { Breadcrumbs } from '@/components/layout';

// Auto-generate from route
<Breadcrumbs />

// Manual items
<Breadcrumbs items={[
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Edit Product' }
]} />
```

### 4. AppHeader (`app-header.tsx`)

Enhanced header with theme toggle and user menu.

**Features:**
- ✅ Sticky header at top (Requirement 11.2)
- ✅ Integrated theme toggle button (Requirement 11.2)
- ✅ User menu dropdown with profile and logout (Requirement 11.2)
- ✅ Mobile hamburger menu button
- ✅ Breadcrumbs integration
- ✅ Responsive design
- ✅ User avatar with initials
- ✅ Dropdown closes on outside click

**Props:**
```typescript
interface AppHeaderProps {
  onMenuToggle?: () => void;    // Callback for mobile menu
  showBreadcrumbs?: boolean;    // Show/hide breadcrumbs (default: true)
}
```

**Usage:**
```tsx
import { AppHeader } from '@/components/layout';

<AppHeader 
  onMenuToggle={() => setMobileMenuOpen(true)}
  showBreadcrumbs={true}
/>
```

### 5. DashboardLayout (`dashboard-layout.tsx`)

Complete layout component integrating all navigation components.

**Features:**
- ✅ Integrates Sidebar, Header, and Mobile Menu
- ✅ Manages sidebar collapse state
- ✅ Manages mobile menu state
- ✅ Responsive layout
- ✅ Proper overflow handling

**Props:**
```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  user: AuthUser;
}
```

**Usage:**
```tsx
import { DashboardLayout } from '@/components/layout';

export default function Page() {
  return (
    <DashboardLayout user={currentUser}>
      <YourPageContent />
    </DashboardLayout>
  );
}
```

## Menu Structure

The sidebar menu is hierarchical and supports:

1. **Top-level items** - Direct navigation links
2. **Grouped items** - Expandable/collapsible groups with children
3. **Role-based filtering** - Items can be restricted to specific roles

### Menu Item Interface

```typescript
interface MenuItem {
  id: string;                    // Unique identifier
  label: string;                 // Display label (Thai)
  icon: React.ReactNode;         // Icon component
  href: string;                  // Navigation path
  badge?: number;                // Optional badge count
  children?: MenuItem[];         // Child menu items
  roles?: Array<'user' | 'admin'>; // Role restrictions
}
```

### Default Menu Structure

```
├── Dashboard
├── Inventory
├── Requisitions
│   ├── Create Requisition
│   └── Requisition History
└── Admin Panel (admin only)
    ├── Approvals
    ├── Products
    ├── Stock Adjustments
    ├── Notices
    ├── Reports
    └── Import
```

## Responsive Behavior

### Desktop (≥ 1024px)
- Sidebar always visible
- Can be collapsed to icon-only mode
- Header shows full breadcrumbs
- User menu shows name

### Tablet (768px - 1023px)
- Sidebar hidden by default
- Mobile menu available
- Header shows breadcrumbs
- User menu shows name

### Mobile (< 768px)
- Sidebar hidden
- Mobile hamburger menu
- Header shows breadcrumbs
- User menu shows avatar only

## Accessibility

All navigation components follow accessibility best practices:

- ✅ Keyboard navigation support
- ✅ ARIA labels for screen readers
- ✅ Focus indicators
- ✅ Semantic HTML
- ✅ Proper heading hierarchy
- ✅ Touch-friendly targets (44x44px minimum)

## Styling

All components use CSS custom properties (design tokens) for theming:

- `--color-surface` - Component backgrounds
- `--color-border` - Borders
- `--color-text` - Primary text
- `--color-text-secondary` - Secondary text
- `--color-text-muted` - Muted text
- `--color-primary` - Active states
- `--color-primary-hover` - Hover states
- `--shadow-lg` - Shadows
- `--transition-normal` - Transitions

## Integration Example

Here's a complete example of integrating the navigation system:

```tsx
// app/(dashboard)/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { AuthUser } from '@/lib/types';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Fetch current user
    fetchUser().then(setUser);
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout user={user}>
      {children}
    </DashboardLayout>
  );
}
```

## Requirements Mapping

| Requirement | Component | Status |
|------------|-----------|--------|
| 1.1 - Persistent sidebar with hierarchical menu | Sidebar | ✅ |
| 1.2 - Hover tooltips and active highlighting | Sidebar | ✅ |
| 1.3 - Icons, labels, role-based filtering | Sidebar | ✅ |
| 1.4 - Breadcrumbs showing hierarchy | Breadcrumbs | ✅ |
| 1.5 - Mobile hamburger menu | MobileMenu | ✅ |
| 9.5 - Collapsible menu on mobile | MobileMenu | ✅ |
| 11.2 - Theme toggle in header | AppHeader | ✅ |
| 11.2 - User menu dropdown | AppHeader | ✅ |
| 11.2 - Sticky header | AppHeader | ✅ |

## Notes

- The theme toggle button is now integrated into the header (removed floating button)
- All text labels use Thai language from `THAI_LABELS` constants
- Menu items automatically filter based on user role
- Active states work for both exact matches and path prefixes
- Smooth animations use CSS transitions with design token timing values
