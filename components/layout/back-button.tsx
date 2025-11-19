'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { THAI_LABELS } from '@/lib/constants/thai-labels';

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // Check if browser history allows going back
    if (typeof window !== 'undefined') {
      // Check if there's history to go back to
      // window.history.length > 1 means there's at least one previous page
      const hasHistory = window.history.length > 1;
      setCanGoBack(hasHistory);
    }
  }, [pathname]);

  const handleBack = () => {
    if (canGoBack) {
      router.back();
      return;
    }

    // Fallback if no history
    if (pathname === '/login') {
      router.push('/login');
      return;
    }

    router.push('/dashboard');
  };

  // Only show button if we can go back
  if (!canGoBack) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-200 hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)]"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)',
      }}
      aria-label={THAI_LABELS.back}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      <span>{THAI_LABELS.back}</span>
    </button>
  );
}
