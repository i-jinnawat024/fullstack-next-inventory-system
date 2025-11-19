'use client';

import { useTheme } from './theme-provider';
import { THAI_LABELS } from '@/lib/constants/thai-labels';

/**
 * Theme Toggle Button Component
 * Provides a floating button to switch between light and dark themes
 * Requirements: 11.2 (theme toggle button with icon)
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <></>
    // <button
    //   onClick={toggleTheme}
    //   className="fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
    //   style={{
    //     backgroundColor: 'var(--color-surface)',
    //     borderColor: 'var(--color-border)',
    //     color: 'var(--color-text)',
    //     boxShadow: 'var(--shadow-lg)',
    //     border: '1px solid var(--color-border)',
    //     transition: 'all var(--transition-normal)', // Smooth transitions (Requirement 11.4)
    //   }}
    //   title={theme === 'light' ? THAI_LABELS.switchToDark : THAI_LABELS.switchToLight}
    //   aria-label={theme === 'light' ? THAI_LABELS.switchToDark : THAI_LABELS.switchToLight}
    // >
    //   {theme === 'light' ? (
    //     // Moon icon for switching to dark mode
    //     <svg
    //       className="w-6 h-6"
    //       fill="none"
    //       stroke="currentColor"
    //       viewBox="0 0 24 24"
    //       xmlns="http://www.w3.org/2000/svg"
    //       style={{ transition: 'transform var(--transition-fast)' }}
    //     >
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth={2}
    //         d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    //       />
    //     </svg>
    //   ) : (
    //     // Sun icon for switching to light mode
    //     <svg
    //       className="w-6 h-6"
    //       fill="none"
    //       stroke="currentColor"
    //       viewBox="0 0 24 24"
    //       xmlns="http://www.w3.org/2000/svg"
    //       style={{ transition: 'transform var(--transition-fast)' }}
    //     >
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth={2}
    //         d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    //       />
    //     </svg>
    //   )}
    // </button>
  );
}