import { useEffect, useRef, RefObject } from 'react';

/**
 * Focus Management Hooks
 * Requirement: 10.4
 * 
 * Provides utilities for managing focus in modals, dropdowns, and other interactive elements
 */

/**
 * Focus Trap Hook
 * Traps focus within a container element (useful for modals and dropdowns)
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  isActive: boolean = true,
  options: {
    initialFocus?: RefObject<HTMLElement>;
    returnFocus?: boolean;
  } = {}
) {
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const { initialFocus, returnFocus = true } = options;

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    // Store the currently focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Get all focusable elements
    const getFocusableElements = () => {
      return Array.from(
        container.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        )
      );
    };

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

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

    // Focus initial element or first focusable element
    if (initialFocus?.current) {
      initialFocus.current.focus();
    } else {
      const focusableElements = getFocusableElements();
      focusableElements[0]?.focus();
    }

    return () => {
      container.removeEventListener('keydown', handleTabKey);

      // Restore focus to previously focused element
      if (returnFocus && previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [containerRef, isActive, initialFocus, returnFocus]);
}

/**
 * Focus Visible Hook
 * Adds visible focus indicators only for keyboard navigation
 */
export function useFocusVisible() {
  useEffect(() => {
    let hadKeyboardEvent = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        hadKeyboardEvent = true;
      }
    };

    const handleMouseDown = () => {
      hadKeyboardEvent = false;
    };

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (hadKeyboardEvent && target) {
        target.setAttribute('data-focus-visible', 'true');
      }
    };

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target) {
        target.removeAttribute('data-focus-visible');
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('blur', handleBlur, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('blur', handleBlur, true);
    };
  }, []);
}

/**
 * Auto Focus Hook
 * Automatically focuses an element when component mounts
 */
export function useAutoFocus<T extends HTMLElement>(
  ref: RefObject<T>,
  enabled: boolean = true
) {
  useEffect(() => {
    if (enabled && ref.current) {
      ref.current.focus();
    }
  }, [ref, enabled]);
}

/**
 * Focus Return Hook
 * Returns focus to a specific element when component unmounts
 */
export function useFocusReturn(
  returnToRef?: RefObject<HTMLElement>
) {
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Store the currently focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    return () => {
      // Return focus to specified element or previously focused element
      if (returnToRef?.current) {
        returnToRef.current.focus();
      } else if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [returnToRef]);
}

/**
 * Roving Tab Index Hook
 * Implements roving tabindex pattern for keyboard navigation in lists
 */
export function useRovingTabIndex(
  itemsRef: RefObject<HTMLElement[]>,
  activeIndex: number = 0
) {
  useEffect(() => {
    const items = itemsRef.current;
    if (!items) return;

    items.forEach((item, index) => {
      if (item) {
        item.setAttribute('tabindex', index === activeIndex ? '0' : '-1');
      }
    });
  }, [itemsRef, activeIndex]);
}
