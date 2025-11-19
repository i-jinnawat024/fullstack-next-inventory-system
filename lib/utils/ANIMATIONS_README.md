# Animations & Transitions Guide

This document describes all animation and transition patterns used in the application, with full support for reduced motion preferences.

## Core Principles

1. **Purposeful**: Every animation serves a purpose (feedback, guidance, or delight)
2. **Fast**: Animations are quick (150-350ms) to feel responsive
3. **Consistent**: Similar actions use similar animations
4. **Accessible**: Respects `prefers-reduced-motion` setting

## Transition Durations

```css
--transition-fast: 150ms ease-in-out;    /* Hover, focus */
--transition-normal: 250ms ease-in-out;  /* Most animations */
--transition-slow: 350ms ease-in-out;    /* Complex transitions */
```

## CSS Animation Classes

### Fade Animations

```tsx
<div className="animate-fade-in">
  Content fades in
</div>
```

### Slide Animations

```tsx
// Slide from right (toast notifications)
<div className="animate-slide-in-right">
  Notification
</div>

// Slide from left (sidebar)
<div className="animate-slide-in-left">
  Menu
</div>

// Slide from top (dropdown)
<div className="animate-slide-in-top">
  Dropdown
</div>

// Slide from bottom (modal)
<div className="animate-slide-in-bottom">
  Modal
</div>
```

### Scale Animations

```tsx
// Scale in (modal content)
<div className="animate-scale-in">
  Modal content
</div>

// Scale up (subtle entrance)
<div className="animate-scale-up">
  Card
</div>
```

### Loading Animations

```tsx
// Pulse (loading state)
<div className="animate-pulse">
  Loading...
</div>

// Spin (spinner)
<div className="animate-spin">
  ⟳
</div>

// Shimmer (skeleton loader)
<div className="animate-shimmer">
  Skeleton
</div>
```

### Hover Effects

```tsx
// Lift on hover
<button className="hover-lift">
  Hover me
</button>

// Scale on hover
<div className="hover-scale">
  Hover to scale
</div>

// Brightness on hover
<img className="hover-brightness" src="..." />
```

### Expand/Collapse

```tsx
// Expand
<div className={isOpen ? 'animate-expand' : 'animate-collapse'}>
  Collapsible content
</div>
```

### Stagger Animations

```tsx
// List items animate in sequence
<ul>
  <li className="stagger-item">Item 1</li>
  <li className="stagger-item">Item 2</li>
  <li className="stagger-item">Item 3</li>
</ul>
```

## JavaScript Animation Utilities

### Check Reduced Motion

```tsx
import { prefersReducedMotion } from '@/lib/utils/animations';

if (prefersReducedMotion()) {
  // Skip animation
} else {
  // Animate
}
```

### Get Transition Duration

```tsx
import { getTransitionDuration } from '@/lib/utils/animations';

const duration = getTransitionDuration(250); // Returns 0 if reduced motion
```

### CSS Transition Helper

```tsx
import { getCSSTransition } from '@/lib/utils/animations';

const transition = getCSSTransition(['opacity', 'transform'], 'normal');
// Returns: "opacity 250ms ease-in-out, transform 250ms ease-in-out"
// Or "none" if reduced motion
```

### Stagger Delay

```tsx
import { getStaggerDelay } from '@/lib/utils/animations';

items.map((item, index) => (
  <div
    key={item.id}
    style={{
      animationDelay: `${getStaggerDelay(index)}ms`
    }}
  >
    {item.name}
  </div>
))
```

## Animation Variants

### Page Transitions

```tsx
import { pageTransitions } from '@/lib/utils/animations';

// Fade transition
<div {...pageTransitions.fade}>
  Page content
</div>

// Slide up transition
<div {...pageTransitions.slideUp}>
  Page content
</div>

// Scale transition
<div {...pageTransitions.scale}>
  Page content
</div>
```

### Modal Animations

```tsx
import { modalAnimations } from '@/lib/utils/animations';

// Backdrop
<div {...modalAnimations.backdrop}>
  Backdrop
</div>

// Content
<div {...modalAnimations.content}>
  Modal content
</div>
```

### Toast Animations

```tsx
import { toastAnimations } from '@/lib/utils/animations';

// Top right (default)
<div {...toastAnimations.topRight}>
  Toast
</div>

// Top left
<div {...toastAnimations.topLeft}>
  Toast
</div>

// Bottom
<div {...toastAnimations.bottom}>
  Toast
</div>
```

### List Item Animations

```tsx
import { listItemAnimations } from '@/lib/utils/animations';

<div {...listItemAnimations.container}>
  {items.map(item => (
    <div key={item.id} {...listItemAnimations.item}>
      {item.name}
    </div>
  ))}
</div>
```

## Common Use Cases

### 1. Theme Switching

Theme transitions are automatic via CSS:

```css
html[data-theme] * {
  transition: background-color var(--transition-fast), 
              border-color var(--transition-fast), 
              color var(--transition-fast);
}
```

**Result**: Smooth color transitions when switching themes

### 2. Button Hover

```tsx
<button className="hover-lift transition-all">
  Click me
</button>
```

**Result**: Button lifts slightly on hover with shadow

### 3. Modal Open/Close

```tsx
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  
  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        {children}
      </div>
    </>
  );
}
```

**Result**: Backdrop fades in, content scales up

### 4. Toast Notification

```tsx
function Toast({ message, onClose }) {
  return (
    <div className="toast-enter-right">
      {message}
      <button onClick={onClose}>×</button>
    </div>
  );
}
```

**Result**: Toast slides in from right

### 5. Dropdown Menu

```tsx
function Dropdown({ isOpen, items }) {
  if (!isOpen) return null;
  
  return (
    <div className="animate-slide-in-top">
      {items.map(item => (
        <div key={item.id}>{item.label}</div>
      ))}
    </div>
  );
}
```

**Result**: Menu slides down from top

### 6. Loading State

```tsx
function LoadingCard() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );
}
```

**Result**: Pulsing skeleton loader

### 7. Card Hover

```tsx
<div className="hover-lift hover-scale transition-all">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>
```

**Result**: Card lifts and scales slightly on hover

### 8. Sidebar Collapse

```tsx
function Sidebar({ isCollapsed }) {
  return (
    <aside
      className="transition-all"
      style={{
        width: isCollapsed ? '64px' : '256px',
      }}
    >
      Sidebar content
    </aside>
  );
}
```

**Result**: Smooth width transition

### 9. Accordion

```tsx
function Accordion({ isOpen, children }) {
  return (
    <div className={isOpen ? 'animate-expand' : 'animate-collapse'}>
      {children}
    </div>
  );
}
```

**Result**: Smooth expand/collapse

### 10. Page Load

```tsx
function Page() {
  return (
    <div className="page-transition">
      Page content
    </div>
  );
}
```

**Result**: Page fades in on load

## Accessibility

### Reduced Motion Support

All animations automatically respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Testing Reduced Motion

**Chrome DevTools:**
1. Open DevTools (F12)
2. Press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
3. Type "Emulate CSS prefers-reduced-motion"
4. Select "prefers-reduced-motion: reduce"

**System Settings:**
- **Windows**: Settings > Ease of Access > Display > Show animations
- **macOS**: System Preferences > Accessibility > Display > Reduce motion
- **Linux**: Varies by desktop environment

### Focus Animations

Focus indicators have subtle animations:

```css
.focus-ring-animated:focus-visible {
  animation: focusPulse 0.3s ease-out;
}

@keyframes focusPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
  }
  100% {
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
  }
}
```

## Performance Tips

### 1. Use Transform and Opacity

✅ **Do:**
```css
.element {
  transform: translateX(100px);
  opacity: 0.5;
}
```

❌ **Don't:**
```css
.element {
  left: 100px;  /* Triggers layout */
  visibility: hidden;  /* Not animatable */
}
```

**Why**: `transform` and `opacity` are GPU-accelerated

### 2. Use will-change Sparingly

✅ **Do:**
```css
.element:hover {
  will-change: transform;
}
```

❌ **Don't:**
```css
.element {
  will-change: transform, opacity, left, top;  /* Too many */
}
```

**Why**: `will-change` uses memory, only use when needed

### 3. Avoid Animating Layout Properties

❌ **Avoid:**
- `width`, `height`
- `margin`, `padding`
- `top`, `left`, `right`, `bottom`

✅ **Prefer:**
- `transform: scale()`
- `transform: translate()`
- `opacity`

### 4. Use CSS Animations for Simple Cases

✅ **Do:**
```css
.element {
  animation: fadeIn 0.3s ease-out;
}
```

❌ **Don't:**
```tsx
// Overkill for simple fade
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

**Why**: CSS animations are more performant

## Animation Checklist

Before deploying:

- [ ] All animations respect `prefers-reduced-motion`
- [ ] Animation durations are 150-350ms
- [ ] Hover effects use `transform` and `opacity`
- [ ] Focus indicators are visible and animated
- [ ] Theme switching is smooth
- [ ] Modal open/close is smooth
- [ ] Toast notifications slide in smoothly
- [ ] Page transitions are subtle
- [ ] Loading states use appropriate animations
- [ ] No janky or stuttering animations
- [ ] Tested with reduced motion enabled
- [ ] No unnecessary animations

## Examples

### Complete Modal Example

```tsx
import { prefersReducedMotion } from '@/lib/utils/animations';

function Modal({ isOpen, onClose, children }) {
  const reducedMotion = prefersReducedMotion();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={reducedMotion ? '' : 'modal-backdrop'}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />
      
      {/* Content */}
      <div
        className={reducedMotion ? '' : 'modal-content'}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          maxWidth: '500px',
          width: '90%',
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

### Complete Toast Example

```tsx
import { prefersReducedMotion } from '@/lib/utils/animations';

function Toast({ message, type, onClose }) {
  const reducedMotion = prefersReducedMotion();
  
  return (
    <div
      className={reducedMotion ? '' : 'toast-enter-right'}
      style={{
        backgroundColor: type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
        color: 'white',
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <span>{message}</span>
      <button onClick={onClose}>×</button>
    </div>
  );
}
```

## Resources

- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [Web.dev: Animations Guide](https://web.dev/animations/)
- [CSS Triggers](https://csstriggers.com/) - What properties trigger layout/paint
