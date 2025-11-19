/**
 * Design Tokens Hook
 * Provides easy access to CSS custom properties (design tokens) in React components
 */

export function useDesignTokens() {
  const getToken = (tokenName: string): string => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();
  };

  return {
    // Colors
    colors: {
      primary: getToken('--color-primary'),
      primaryHover: getToken('--color-primary-hover'),
      primaryActive: getToken('--color-primary-active'),
      background: getToken('--color-background'),
      surface: getToken('--color-surface'),
      surfaceHover: getToken('--color-surface-hover'),
      text: getToken('--color-text'),
      textSecondary: getToken('--color-text-secondary'),
      textMuted: getToken('--color-text-muted'),
      border: getToken('--color-border'),
      borderLight: getToken('--color-border-light'),
      success: getToken('--color-success'),
      warning: getToken('--color-warning'),
      error: getToken('--color-error'),
      info: getToken('--color-info'),
    },
    // Spacing
    spacing: {
      xs: getToken('--spacing-xs'),
      sm: getToken('--spacing-sm'),
      md: getToken('--spacing-md'),
      lg: getToken('--spacing-lg'),
      xl: getToken('--spacing-xl'),
      '2xl': getToken('--spacing-2xl'),
    },
    // Typography
    fontSize: {
      xs: getToken('--font-size-xs'),
      sm: getToken('--font-size-sm'),
      base: getToken('--font-size-base'),
      lg: getToken('--font-size-lg'),
      xl: getToken('--font-size-xl'),
      '2xl': getToken('--font-size-2xl'),
      '3xl': getToken('--font-size-3xl'),
    },
    // Border Radius
    radius: {
      sm: getToken('--radius-sm'),
      md: getToken('--radius-md'),
      lg: getToken('--radius-lg'),
      xl: getToken('--radius-xl'),
      full: getToken('--radius-full'),
    },
    // Shadows
    shadow: {
      sm: getToken('--shadow-sm'),
      md: getToken('--shadow-md'),
      lg: getToken('--shadow-lg'),
      xl: getToken('--shadow-xl'),
    },
    // Transitions
    transition: {
      fast: getToken('--transition-fast'),
      normal: getToken('--transition-normal'),
      slow: getToken('--transition-slow'),
    },
    // Utility function to get any token
    getToken,
  };
}
