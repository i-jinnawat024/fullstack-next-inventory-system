import { useEffect, useCallback, RefObject } from 'react';

/**
 * Keyboard Navigation Hook
 * Requirement: 10.1
 * 
 * Provides keyboard navigation utilities for interactive elements
 */

interface UseKeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: (shiftKey: boolean) => void;
  enabled?: boolean;
}

export function useKeyboardNavigation(options: UseKeyboardNavigationOptions) {
  const {
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    enabled = true,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;
        case 'Enter':
          if (onEnter) {
            event.preventDefault();
            onEnter();
          }
          break;
        case 'ArrowUp':
          if (onArrowUp) {
            event.preventDefault();
            onArrowUp();
          }
          break;
        case 'ArrowDown':
          if (onArrowDown) {
            event.preventDefault();
            onArrowDown();
          }
          break;
        case 'ArrowLeft':
          if (onArrowLeft) {
            event.preventDefault();
            onArrowLeft();
          }
          break;
        case 'ArrowRight':
          if (onArrowRight) {
            event.preventDefault();
            onArrowRight();
          }
          break;
        case 'Tab':
          if (onTab) {
            event.preventDefault();
            onTab(event.shiftKey);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onEscape, onEnter, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onTab]);
}

/**
 * Focus Trap Hook
 * Requirement: 10.4
 * 
 * Traps focus within a container (useful for modals and dropdowns)
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  isActive: boolean = true
) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Focus first element when trap activates
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [containerRef, isActive]);
}

/**
 * Arrow Key Navigation Hook
 * Requirement: 10.1
 * 
 * Enables arrow key navigation for lists and menus
 */
export function useArrowKeyNavigation(
  itemsRef: RefObject<HTMLElement[]>,
  options: {
    orientation?: 'vertical' | 'horizontal';
    loop?: boolean;
    onSelect?: (index: number) => void;
  } = {}
) {
  const { orientation = 'vertical', loop = true, onSelect } = options;

  const focusItem = useCallback((index: number) => {
    const items = itemsRef.current;
    if (!items || !items[index]) return;

    items[index].focus();
  }, [itemsRef]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const items = itemsRef.current;
    if (!items || items.length === 0) return;

    const currentIndex = items.findIndex(item => item === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    if (orientation === 'vertical') {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        nextIndex = currentIndex + 1;
        if (nextIndex >= items.length) {
          nextIndex = loop ? 0 : items.length - 1;
        }
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        nextIndex = currentIndex - 1;
        if (nextIndex < 0) {
          nextIndex = loop ? items.length - 1 : 0;
        }
      }
    } else {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextIndex = currentIndex + 1;
        if (nextIndex >= items.length) {
          nextIndex = loop ? 0 : items.length - 1;
        }
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        nextIndex = currentIndex - 1;
        if (nextIndex < 0) {
          nextIndex = loop ? items.length - 1 : 0;
        }
      }
    }

    if (event.key === 'Enter' && onSelect) {
      event.preventDefault();
      onSelect(currentIndex);
    }

    if (nextIndex !== currentIndex) {
      focusItem(nextIndex);
    }
  }, [itemsRef, orientation, loop, onSelect, focusItem]);

  return { handleKeyDown, focusItem };
}

/**
 * Keyboard Shortcuts Hook
 * Requirement: 10.1
 * 
 * Registers global keyboard shortcuts
 */
interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  callback: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
        const shiftMatch = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;
        const altMatch = shortcut.altKey === undefined || event.altKey === shortcut.altKey;
        const metaMatch = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          event.preventDefault();
          shortcut.callback();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}
