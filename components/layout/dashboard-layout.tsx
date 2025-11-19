'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { MobileMenu } from './mobile-menu';
import { AppHeader } from './app-header';
import { SkipToContent } from '@/components/ui/skip-to-content';
import type { AuthUser } from '@/lib/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: AuthUser;
}

/**
 * Dashboard Layout Component
 * Integrates Sidebar, Header, and Mobile Menu
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 9.5, 11.2
 * 
 * Features:
 * - Persistent sidebar navigation on desktop
 * - Collapsible sidebar
 * - Mobile-responsive hamburger menu
 * - Sticky header with breadcrumbs
 * - Theme toggle integration
 * - User menu dropdown
 */
export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tabletSidebarOpen, setTabletSidebarOpen] = useState(true);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Skip to Main Content Link - Requirement: 10.4 */}
      <SkipToContent />

      {/* Desktop Sidebar - Always visible on desktop (>= 1024px) */}
      <aside className="hidden lg:block" aria-label="หลัก">
        <Sidebar
          user={user}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </aside>

      {/* Tablet Sidebar - Toggleable on tablet (768-1023px) */}
      <aside className="hidden md:block lg:hidden" aria-label="หลัก">
        {tabletSidebarOpen && (
          <div className="relative">
            <Sidebar
              user={user}
              collapsed={false}
              onToggle={() => setTabletSidebarOpen(false)}
            />
          </div>
        )}
      </aside>

      {/* Mobile Menu - Only on mobile (< 768px) */}
      <MobileMenu
        user={user}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AppHeader
          onMenuToggle={() => {
            // Mobile: open mobile menu
            // Tablet: toggle tablet sidebar
            if (window.innerWidth < 768) {
              setMobileMenuOpen(true);
            } else if (window.innerWidth < 1024) {
              setTabletSidebarOpen(!tabletSidebarOpen);
            }
          }}
          showBreadcrumbs={true}
        />

        {/* Page Content - Responsive padding: mobile (16px), tablet (24px), desktop (24px) */}
        <main id="main-content" className="flex-1 overflow-y-auto" tabIndex={-1}>
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
