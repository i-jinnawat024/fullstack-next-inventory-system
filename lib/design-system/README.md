# Design System Documentation

## Overview

This design system provides a comprehensive set of design tokens and components for building consistent, accessible, and themeable user interfaces. It supports both light and dark themes with smooth transitions.

## Design Tokens

Design tokens are defined as CSS custom properties in `app/globals.css` and can be accessed throughout the application.

### Colors

#### Primary Colors
- `--color-primary`: Main brand color
- `--color-primary-hover`: Hover state for primary elements
- `--color-primary-active`: Active/pressed state for primary elements

#### Background Colors
- `--color-background`: Main background color
- `--color-bg-secondary`: Secondary background (cards, panels)
- `--color-bg-tertiary`: Tertiary background (hover states)

#### Text Colors
- `--color-text`: Primary text color
- `--color-text-secondary`: Secondary text (labels, captions)
- `--color-text-muted`: Muted text (placeholders, disabled)

#### Surface Colors
- `--color-surface`: Surface background (cards, modals)
- `--color-surface-hover`: Surface hover state

#### Border Colors
- `--color-border`: Default border color
- `--color-border-light`: Light border color

#### Status Colors
- `--color-success`: Success state
- `--color-warning`: Warning state
- `--color-error`: Error state
- `--color-info`: Info state

### Typography

#### Font Sizes
- `--font-size-xs`: 12px
- `--font-size-sm`: 14px
- `--font-size-base`: 16px
- `--font-size-lg`: 18px
- `--font-size-xl`: 20px
- `--font-size-2xl`: 24px
- `--font-size-3xl`: 30px

#### Font Weights
- `--font-weight-normal`: 400
- `--font-weight-medium`: 500
- `--font-weight-semibold`: 600
- `--font-weight-bold`: 700

### Spacing

- `--spacing-xs`: 4px
- `--spacing-sm`: 8px
- `--spacing-md`: 16px
- `--spacing-lg`: 24px
- `--spacing-xl`: 32px
- `--spacing-2xl`: 48px

### Border Radius

- `--radius-sm`: 4px
- `--radius-md`: 6px
- `--radius-lg`: 8px
- `--radius-xl`: 12px
- `--radius-full`: 9999px (fully rounded)

### Shadows

- `--shadow-sm`: Small shadow for subtle elevation
- `--shadow-md`: Medium shadow for cards
- `--shadow-lg`: Large shadow for modals
- `--shadow-xl`: Extra large shadow for floating elements

### Transitions

- `--transition-fast`: 150ms ease-in-out
- `--transition-normal`: 250ms ease-in-out
- `--transition-slow`: 350ms ease-in-out

## Theme System

### Using the Theme Provider

The theme provider is already set up in the root layout. It provides:
- Light mode as default (Requirement 11.1)
- Theme persistence using localStorage (Requirement 11.3)
- Smooth transitions when switching themes (Requirement 11.4)

```tsx
import { ThemeProvider } from '@/components/layout/theme-provider';

<ThemeProvider defaultTheme="light">
  {children}
</ThemeProvider>
```

### Using the Theme Hook

Access and control the theme in any component:

```tsx
import { useTheme } from '@/components/layout/theme-provider';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

### Theme Toggle Button

A floating theme toggle button is available (Requirement 11.2):

```tsx
import { ThemeToggle } from '@/components/layout/theme-toggle';

<ThemeToggle />
```

## Using Design Tokens

### In CSS/Inline Styles

```tsx
<div style={{
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
  padding: 'var(--spacing-md)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-md)',
  transition: 'all var(--transition-normal)'
}}>
  Content
</div>
```

### Using the Design Tokens Hook

```tsx
import { useDesignTokens } from '@/lib/hooks/use-design-tokens';

function MyComponent() {
  const tokens = useDesignTokens();
  
  return (
    <div style={{
      backgroundColor: tokens.colors.surface,
      padding: tokens.spacing.md,
      borderRadius: tokens.radius.lg
    }}>
      Content
    </div>
  );
}
```

## Best Practices

1. **Always use design tokens** instead of hardcoded values
2. **Use semantic color names** (e.g., `--color-text` instead of specific hex values)
3. **Add transitions** to interactive elements for smooth theme switching
4. **Test both themes** to ensure proper contrast and readability
5. **Use consistent spacing** from the spacing scale
6. **Follow the typography scale** for text sizing

## Accessibility

The theme system ensures:
- Proper color contrast ratios (4.5:1 for text, 3:1 for UI components)
- Support for both light and dark modes
- Smooth transitions that respect user preferences
- Keyboard accessible theme toggle

## Requirements Fulfilled

- ✅ 11.1: Light mode as default theme
- ✅ 11.2: Theme toggle button in the header/user menu
- ✅ 11.3: Theme persistence using localStorage
- ✅ 11.4: Smooth transitions for theme switching
- ✅ 11.5: Support for both light and dark color schemes
- ✅ 11.6: Restore user's previously selected theme preference
