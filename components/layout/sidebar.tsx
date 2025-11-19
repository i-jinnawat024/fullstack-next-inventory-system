'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { THAI_LABELS } from '@/lib/constants/thai-labels';
import type { AuthUser } from '@/lib/types';

/**
 * Menu Item Interface
 * Defines the structure for navigation menu items
 */
export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  children?: MenuItem[];
  roles?: Array<'user' | 'admin'>;
}

interface SidebarProps {
  user: AuthUser;
  collapsed?: boolean;
  onToggle?: () => void;
}

/**
 * Sidebar Navigation Component
 * Requirements: 1.1, 1.2, 1.3, 1.5, 9.5
 * 
 * Features:
 * - Collapsible sidebar with hierarchical menu structure
 * - Active state highlighting for current page
 * - Icons and labels for each menu item
 * - Role-based menu filtering
 * - Hover tooltips for menu items
 * - Mobile-responsive hamburger menu (< 768px)
 * - Smooth collapse/expand animations
 */
export function Sidebar({ user, collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Define menu structure with hierarchical organization
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: THAI_LABELS.dashboard,
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'inventory',
      label: THAI_LABELS.inventory,
      href: '/inventory',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      id: 'requisitions',
      label: THAI_LABELS.requisitions,
      href: '/requisitions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      children: [
        {
          id: 'requisitions-create',
          label: THAI_LABELS.createRequisition,
          href: '/requisitions/create',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          ),
        },
        {
          id: 'requisitions-history',
          label: THAI_LABELS.requisitionHistory,
          href: '/requisitions/history',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
      ],
    },
    {
      id: 'admin',
      label: THAI_LABELS.adminPanel,
      href: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      roles: ['admin'],
      children: [
        {
          id: 'admin-approvals',
          label: THAI_LABELS.approvals,
          href: '/admin/approvals',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          roles: ['admin'],
        },
        {
          id: 'admin-products',
          label: THAI_LABELS.products,
          href: '/admin/products',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
          roles: ['admin'],
        },
        {
          id: 'admin-stock-adjustments',
          label: THAI_LABELS.stockAdjustments,
          href: '/admin/stock-adjustments',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
          roles: ['admin'],
        },
        {
          id: 'admin-notices',
          label: THAI_LABELS.notices,
          href: '/admin/notices',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          ),
          roles: ['admin'],
        },
        {
          id: 'admin-reports',
          label: THAI_LABELS.reports,
          href: '/admin/reports',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
          roles: ['admin'],
        },
        {
          id: 'admin-users',
          label: THAI_LABELS.userManagement,
          href: '/admin/users',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
          roles: ['admin'],
        },
        {
          id: 'admin-import',
          label: THAI_LABELS.import,
          href: '/admin/import',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          ),
          roles: ['admin'],
        },
      ],
    },
  ];

  // Filter menu items based on user role (Requirement 1.3)
  const filterMenuByRole = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter(item => !item.roles || item.roles.includes(user.role))
      .map(item => ({
        ...item,
        children: item.children ? filterMenuByRole(item.children) : undefined,
      }));
  };

  const filteredMenu = filterMenuByRole(menuItems);

  // Check if a menu item or its children are active
  const isActive = (item: MenuItem): boolean => {
    if (pathname === item.href) return true;
    if (item.children) {
      return item.children.some(child => pathname === child.href || pathname.startsWith(child.href + '/'));
    }
    return pathname.startsWith(item.href + '/');
  };

  // Toggle group expansion
  const toggleGroup = (itemId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // Auto-expand active groups
  const isGroupExpanded = (item: MenuItem): boolean => {
    if (expandedGroups.has(item.id)) return true;
    if (item.children && isActive(item)) return true;
    return false;
  };

  return (
    <nav
      className="flex flex-col h-full transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? '4rem' : '16rem',
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
      }}
      aria-label="เมนูหลัก"
    >
      {/* Logo/Header */}
      <div
        className="flex items-center h-16 px-4 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {!collapsed && (
          <h1
            className="text-lg font-semibold truncate"
            style={{ color: 'var(--color-text)' }}
          >
            {THAI_LABELS.companyName}
          </h1>
        )}
        {collapsed && (
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center font-bold"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
            }}
          >
            ร
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto" role="navigation">
        {filteredMenu.map(item => (
          <div key={item.id}>
            {/* Parent Menu Item - Enhanced touch targets for mobile */}
            {item.children ? (
              <button
                onClick={() => toggleGroup(item.id)}
                className="w-full flex items-center justify-between px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:opacity-80"
                style={{
                  backgroundColor: isActive(item) ? 'var(--color-primary)' : 'transparent',
                  color: isActive(item) ? 'white' : 'var(--color-text)',
                  minHeight: '44px', // Ensure minimum touch target
                }}
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
              >
                <div className="flex items-center min-w-0">
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="ml-3 truncate">{item.label}</span>}
                </div>
                {!collapsed && item.children && (
                  <svg
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isGroupExpanded(item) ? 'rotate-90' : ''
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            ) : (
              <Link
                href={item.href}
                className="flex items-center px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:opacity-80"
                style={{
                  backgroundColor: isActive(item) ? 'var(--color-primary)' : 'transparent',
                  color: isActive(item) ? 'white' : 'var(--color-text)',
                  minHeight: '44px', // Ensure minimum touch target
                }}
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <span className="ml-3 truncate flex-1">{item.label}</span>
                )}
                {!collapsed && item.badge !== undefined && (
                  <span
                    className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full"
                    style={{
                      backgroundColor: 'var(--color-error)',
                      color: 'white',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            )}

            {/* Child Menu Items - Enhanced touch targets for mobile */}
            {item.children && isGroupExpanded(item) && !collapsed && (
              <div className="ml-4 mt-1 space-y-1">
                {item.children.map(child => (
                  <Link
                    key={child.id}
                    href={child.href}
                    className="flex items-center px-3 py-3 md:py-2 rounded-md text-sm transition-colors duration-200 hover:opacity-80"
                    style={{
                      backgroundColor: pathname === child.href ? 'var(--color-primary-hover)' : 'transparent',
                      color: pathname === child.href ? 'white' : 'var(--color-text-secondary)',
                      minHeight: '44px', // Ensure minimum touch target
                    }}
                    title={child.label}
                    aria-label={child.label}
                  >
                    <span className="flex-shrink-0">{child.icon}</span>
                    <span className="ml-3 truncate">{child.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User Info Section */}
      <div
        className="p-4 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {!collapsed ? (
          <div className="flex items-center">
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: 'var(--color-text)' }}
              >
                {user.name}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {user.department}
              </p>
            </div>
          </div>
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
            }}
            title={user.name}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Collapse Toggle Button */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="hidden lg:flex items-center justify-center h-12 border-t transition-colors duration-200 hover:opacity-80"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
          aria-label={collapsed ? 'ขยายเมนู' : 'ย่อเมนู'}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
    </nav>
  );
}

