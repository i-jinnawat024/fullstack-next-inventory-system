'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/format';
import { THAI_LABELS } from '@/lib/constants/thai-labels';
import { ThemeToggle } from './theme-toggle';

interface User {
  name: string;
  email: string;
  role: 'user' | 'admin';
  department: string;
}

interface MenuItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

interface AppLayoutProps {
  children: React.ReactNode;
  user: User;
}

export function AppLayout({ children, user }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      href: '/dashboard',
      label: THAI_LABELS.dashboard,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
        </svg>
      ),
    },
    {
      href: '/inventory',
      label: THAI_LABELS.inventory,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      href: '/requisitions',
      label: THAI_LABELS.requisitions,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      href: '/requisitions/create',
      label: THAI_LABELS.createRequisition,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      href: '/requisitions/history',
      label: THAI_LABELS.requisitionHistory,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    // Admin-only items
    {
      href: '/admin/approvals',
      label: THAI_LABELS.approvals,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      adminOnly: true,
    },
    {
      href: '/admin/products',
      label: THAI_LABELS.products,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      adminOnly: true,
    },
    {
      href: '/admin/stock-adjustments',
      label: THAI_LABELS.stockAdjustments,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4" />
        </svg>
      ),
      adminOnly: true,
    },
    {
      href: '/admin/notices',
      label: THAI_LABELS.notices,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      adminOnly: true,
    },
    {
      href: '/admin/reports',
      label: THAI_LABELS.reports,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      adminOnly: true,
    },
    {
      href: '/admin/import',
      label: THAI_LABELS.import,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ),
      adminOnly: true,
    },
  ];

  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || user.role === 'admin');

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              {THAI_LABELS.companyName}
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                    isActive
                      ? 'text-white'
                      : 'hover:opacity-80'
                  )}
                  style={{
                    backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                    color: isActive ? 'white' : 'var(--color-text)',
                  }}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                  {user.name}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                  {user.department}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-3 p-2 rounded-md transition-colors duration-200 hover:opacity-80"
                style={{ color: 'var(--color-text-secondary)' }}
                title={THAI_LABELS.logout}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <header
          className="sticky top-0 z-30 flex items-center h-16 px-4 border-b lg:px-6"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md lg:hidden transition-colors duration-200 hover:opacity-80"
            style={{ color: 'var(--color-text)' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1" />

          {/* User info on mobile */}
          <div className="flex items-center lg:hidden">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              {user.name}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Theme toggle */}
      <ThemeToggle />
    </div>
  );
}