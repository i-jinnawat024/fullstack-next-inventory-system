import { ReactNode } from 'react';
import { cn } from '@/lib/utils/format';

interface FormGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

/**
 * FormGrid Component
 * Responsive grid layout for forms
 * 
 * Behavior:
 * - Mobile (< 768px): Always 1 column
 * - Tablet (768-1023px): 2 columns if columns >= 2
 * - Desktop (>= 1024px): Uses specified columns
 */
export function FormGrid({ children, columns = 1, className }: FormGridProps) {
  const gridClasses = cn(
    'grid gap-4 md:gap-6',
    {
      'grid-cols-1': columns === 1,
      'grid-cols-1 md:grid-cols-2': columns === 2,
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': columns === 3,
    },
    className
  );

  return <div className={gridClasses}>{children}</div>;
}

export type { FormGridProps };
