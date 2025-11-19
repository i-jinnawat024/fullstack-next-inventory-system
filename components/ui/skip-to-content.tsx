'use client';

import { THAI_LABELS } from '@/lib/constants/thai-labels';

/**
 * Skip to Main Content Link
 * Requirement: 10.4
 * 
 * Provides a keyboard-accessible link to skip navigation and jump to main content
 * Only visible when focused via keyboard navigation
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-md focus:font-medium focus:text-sm focus:shadow-lg transition-all duration-200"
      style={{
        backgroundColor: 'var(--color-primary)',
        color: '#ffffff',
      }}
    >
      {THAI_LABELS.skipToMainContent || 'ข้ามไปยังเนื้อหาหลัก'}
    </a>
  );
}
