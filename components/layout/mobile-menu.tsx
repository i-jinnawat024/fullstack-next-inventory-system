'use client';

import { useEffect } from 'react';
import { Sidebar } from './sidebar';
import type { AuthUser } from '@/lib/types';

interface MobileMenuProps {
  user: AuthUser;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile Menu Component
 * Requirements: 1.5, 9.5
 * 
 * Features:
 * - Mobile-responsive hamburger menu (< 768px)
 * - Overlay backdrop
 * - Smooth slide-in animation
 * - Close on backdrop click
 * - Close on navigation
 */
export function MobileMenu({ user, isOpen, onClose }: MobileMenuProps) {
  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Touch-friendly close area */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
        style={{ touchAction: 'none' }}
      />

      {/* Mobile Sidebar - Optimized width for mobile (280px for better touch targets) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar user={user} />
      </div>
    </>
  );
}
