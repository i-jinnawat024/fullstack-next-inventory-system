'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { THAI_LABELS } from '@/lib/constants/thai-labels';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  maxItems?: number;
}

/**
 * Breadcrumbs Component
 * Requirements: 1.4
 * 
 * Features:
 * - Shows page hierarchy
 * - Auto-generates breadcrumbs from current route
 * - Clickable navigation for all items except current
 * - Truncation for long paths
 * - Proper spacing and separators
 */
export function Breadcrumbs({ items, maxItems = 4 }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Route label mapping for Thai translations
  const routeLabels: Record<string, string> = {
    dashboard: THAI_LABELS.dashboard,
    inventory: THAI_LABELS.inventory,
    requisitions: THAI_LABELS.requisitions,
    create: THAI_LABELS.createRequisition,
    history: THAI_LABELS.requisitionHistory,
    admin: THAI_LABELS.adminPanel,
    approvals: THAI_LABELS.approvals,
    products: THAI_LABELS.products,
    'stock-adjustments': THAI_LABELS.stockAdjustments,
    notices: THAI_LABELS.notices,
    reports: THAI_LABELS.reports,
    import: THAI_LABELS.import,
  };

  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const segments = pathname.split('/').filter(Boolean);
    
    if (segments.length === 0) {
      return [{ label: THAI_LABELS.dashboard, href: '/dashboard' }];
    }

    const crumbs: BreadcrumbItem[] = [];
    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = routeLabels[segment] || segment;
      
      // Last item should not have href (current page)
      if (index === segments.length - 1) {
        crumbs.push({ label });
      } else {
        crumbs.push({ label, href: currentPath });
      }
    });

    return crumbs;
  })();

  // Truncate breadcrumbs if exceeds maxItems
  const displayItems = breadcrumbItems.length > maxItems
    ? [
        breadcrumbItems[0],
        { label: '...', href: undefined },
        ...breadcrumbItems.slice(-(maxItems - 2)),
      ]
    : breadcrumbItems;

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <nav
      className="flex items-center space-x-2 text-sm"
      aria-label="Breadcrumb"
    >
      {/* Home Icon */}
      <Link
        href="/dashboard"
        className="flex items-center transition-colors duration-200 hover:opacity-80"
        style={{ color: 'var(--color-text-secondary)' }}
        aria-label="หน้าแรก"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </Link>

      {/* Breadcrumb Items */}
      {displayItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {/* Separator */}
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: 'var(--color-border)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>

          {/* Breadcrumb Link or Text */}
          {item.href ? (
            <Link
              href={item.href}
              className="transition-colors duration-200 hover:opacity-80 truncate max-w-[200px]"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {item.label}
            </Link>
          ) : item.label === '...' ? (
            <span
              className="cursor-default"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {item.label}
            </span>
          ) : (
            <span
              className="font-medium truncate max-w-[200px]"
              style={{ color: 'var(--color-text)' }}
              aria-current="page"
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
