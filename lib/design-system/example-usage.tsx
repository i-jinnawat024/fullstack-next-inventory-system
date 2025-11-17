/**
 * Example Usage of Design System
 * This file demonstrates how to use design tokens and the theme system
 */

import { useTheme } from '@/components/layout/theme-provider';
import { useDesignTokens } from '@/lib/hooks/use-design-tokens';

// Example 1: Using design tokens with inline styles
export function CardExample() {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text)',
        padding: 'var(--spacing-lg)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--color-border)',
        transition: 'all var(--transition-normal)',
      }}
    >
      <h2
        style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: 'var(--spacing-sm)',
        }}
      >
        Card Title
      </h2>
      <p
        style={{
          fontSize: 'var(--font-size-base)',
          color: 'var(--color-text-secondary)',
        }}
      >
        This card uses design tokens for consistent styling across themes.
      </p>
    </div>
  );
}

// Example 2: Using the theme hook
export function ThemeAwareComponent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      style={{
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <p style={{ color: 'var(--color-text)' }}>
        Current theme: {theme}
      </p>
      <button
        onClick={toggleTheme}
        style={{
          marginTop: 'var(--spacing-sm)',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          backgroundColor: 'var(--color-primary)',
          color: '#ffffff',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          transition: 'background-color var(--transition-fast)',
        }}
      >
        Toggle Theme
      </button>
    </div>
  );
}

// Example 3: Using the design tokens hook
export function TokensExample() {
  const tokens = useDesignTokens();

  return (
    <div
      style={{
        backgroundColor: tokens.colors.surface,
        padding: tokens.spacing.lg,
        borderRadius: tokens.radius.lg,
        boxShadow: tokens.shadow.md,
      }}
    >
      <h3
        style={{
          fontSize: tokens.fontSize.lg,
          color: tokens.colors.text,
          marginBottom: tokens.spacing.sm,
        }}
      >
        Using Design Tokens Hook
      </h3>
      <p style={{ color: tokens.colors.textSecondary }}>
        This component uses the useDesignTokens hook for type-safe access to design tokens.
      </p>
    </div>
  );
}

// Example 4: Status badges using design tokens
export function StatusBadgeExample() {
  const statuses = [
    { label: 'Success', color: 'var(--color-success)' },
    { label: 'Warning', color: 'var(--color-warning)' },
    { label: 'Error', color: 'var(--color-error)' },
    { label: 'Info', color: 'var(--color-info)' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--spacing-sm)',
        flexWrap: 'wrap',
      }}
    >
      {statuses.map((status) => (
        <span
          key={status.label}
          style={{
            padding: 'var(--spacing-xs) var(--spacing-sm)',
            backgroundColor: status.color,
            color: '#ffffff',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
          }}
        >
          {status.label}
        </span>
      ))}
    </div>
  );
}

// Example 5: Button with hover states
export function ButtonExample() {
  return (
    <button
      style={{
        padding: 'var(--spacing-sm) var(--spacing-lg)',
        backgroundColor: 'var(--color-primary)',
        color: '#ffffff',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--font-size-base)',
        fontWeight: 'var(--font-weight-medium)',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-primary)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      Click Me
    </button>
  );
}
