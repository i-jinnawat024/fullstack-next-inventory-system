import React, { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Utility for lazy loading components with better error handling
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): LazyExoticComponent<T> {
  return lazy(() =>
    importFunc().catch((error) => {
      console.error('Error loading component:', error);
      // Return a fallback component on error
      return {
        default: (() => (
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '0.5rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            ไม่สามารถโหลดส่วนประกอบได้ กรุณาลองใหม่อีกครั้ง
          </div>
        )) as unknown as T,
      };
    })
  );
}

/**
 * Preload a lazy component
 */
export function preloadComponent<T extends ComponentType<any>>(
  lazyComponent: LazyExoticComponent<T>
): void {
  // @ts-ignore - accessing internal preload method
  if (lazyComponent._payload && lazyComponent._payload._result === null) {
    // @ts-ignore
    lazyComponent._payload._result = lazyComponent._payload._init(lazyComponent._payload);
  }
}
