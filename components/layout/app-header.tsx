'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Breadcrumbs } from './breadcrumbs';
import { useTheme } from './theme-provider';
import { THAI_LABELS } from '@/lib/constants/thai-labels';
import { ApiResponse, AuthUser } from '@/lib/types';

interface AppHeaderProps {
  onMenuToggle?: () => void;
  showBreadcrumbs?: boolean;
}

/**
 * App Header Component
 * Requirements: 11.2
 * 
 * Features:
 * - Sticky header at top
 * - Integrated theme toggle button
 * - User menu dropdown with profile and logout
 * - Mobile hamburger menu button
 * - Breadcrumbs navigation
 * - Responsive design
 */
export function AppHeader({ onMenuToggle, showBreadcrumbs = true }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (response.status === 401) {
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          });

          if (!refreshResponse.ok) {
            if (active) {
              setUser(null);
              setErrorMessage(THAI_LABELS.loginError);
              if (pathname !== '/login') {
                router.replace('/login');
              }
            }
            return;
          }

          const refreshResult: ApiResponse<AuthUser> = await refreshResponse.json();
          if (active) {
            if (refreshResult.success && refreshResult.data) {
              setUser(refreshResult.data);
              setErrorMessage(null);
            } else {
              setUser(null);
              setErrorMessage(refreshResult.error?.message || THAI_LABELS.loginError);
            }
          }
          return;
        }

        const result: ApiResponse<AuthUser> = await response.json();
        if (!active) return;

        if (result.success && result.data) {
          setUser(result.data);
          setErrorMessage(null);
        } else {
          setUser(null);
          setErrorMessage(result.error?.message || THAI_LABELS.loginError);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(THAI_LABELS.networkError);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, [pathname, router]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-user-menu]')) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setUser(null);
      setUserMenuOpen(false);
      router.push('/login');
      router.refresh();
    }
  };

  const roleLabel = user?.role === 'admin' ? THAI_LABELS.admin : THAI_LABELS.user;

  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center h-16 px-4 lg:px-6">
        {/* Menu Button - Mobile & Tablet - Enhanced touch target */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-md lg:hidden transition-colors duration-200 hover:opacity-80 mr-3"
            style={{ 
              color: 'var(--color-text)',
              minWidth: '44px',
              minHeight: '44px',
            }}
            aria-label="เปิดเมนู"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <div className="flex-1 min-w-0">
            <Breadcrumbs />
          </div>
        )}

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Theme Toggle Button (Requirement 11.2) - Enhanced touch target */}
          {/* <button
            onClick={toggleTheme}
            className="p-2 rounded-md transition-colors duration-200 hover:opacity-80"
            style={{ 
              color: 'var(--color-text-secondary)',
              minWidth: '44px',
              minHeight: '44px',
            }}
            title={theme === 'light' ? THAI_LABELS.switchToDark : THAI_LABELS.switchToLight}
            aria-label={theme === 'light' ? THAI_LABELS.switchToDark : THAI_LABELS.switchToLight}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            )}
          </button> */}

          {/* User Menu Dropdown - Enhanced touch target */}
          {!loading && user && (
            <div className="relative" data-user-menu>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-md transition-colors duration-200 hover:opacity-80"
                style={{ 
                  color: 'var(--color-text)',
                  minHeight: '44px',
                }}
                aria-label="เมนูผู้ใช้"
                aria-expanded={userMenuOpen}
              >
                {/* User Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>

                {/* User Name (hidden on mobile) */}
                <span className="hidden md:block text-sm font-medium">
                  {user.name}
                </span>

                {/* Dropdown Arrow */}
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-md shadow-lg overflow-hidden"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                  role="menu"
                  aria-label="เมนูผู้ใช้"
                >
                  {/* User Info */}
                  <div
                    className="px-4 py-3 border-b"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {user.name}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {user.email}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {user.department} • {roleLabel}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm transition-colors duration-200"
                      style={{ color: 'var(--color-text)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      onClick={() => setUserMenuOpen(false)}
                      role="menuitem"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      โปรไฟล์
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm transition-colors duration-200"
                      style={{ color: 'var(--color-error)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      role="menuitem"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {THAI_LABELS.logout}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {THAI_LABELS.loading}
            </div>
          )}

          {/* Not Logged In */}
          {!loading && !user && (
            <Link
              href="/login"
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
              }}
            >
              {THAI_LABELS.login}
            </Link>
          )}
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div
          className="px-4 py-2 text-xs border-t"
          style={{
            backgroundColor: 'var(--color-error-light)',
            color: 'var(--color-error)',
            borderColor: 'var(--color-border)',
          }}
        >
          {errorMessage}
        </div>
      )}
    </header>
  );
}
