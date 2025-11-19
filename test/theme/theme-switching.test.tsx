/**
 * Theme Switching Functionality Tests
 * Tests for smooth theme transitions, color updates, and localStorage persistence
 * Requirements: 4.2, 6.3
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/components/layout/theme-provider';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component that uses theme
function TestComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button data-testid="toggle-button" onClick={toggleTheme}>
        Toggle Theme
      </button>
      <button data-testid="set-light-button" onClick={() => setTheme('light')}>
        Set Light
      </button>
      <button data-testid="set-dark-button" onClick={() => setTheme('dark')}>
        Set Dark
      </button>
    </div>
  );
}

describe('Theme Switching Functionality', () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorageMock.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  describe('Smooth transitions between light and dark themes', () => {
    it('should toggle from dark to light theme', async () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <TestComponent />
        </ThemeProvider>
      );

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      });

      // Verify dark theme is applied to document
      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });

      // Toggle to light theme
      await act(async () => {
        fireEvent.click(screen.getByTestId('toggle-button'));
      });

      // Verify light theme is applied
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      });

      // Verify light theme removes data-theme attribute
      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBeNull();
      });
    });

    it('should toggle from light to dark theme', async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      );

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      });

      // Toggle to dark theme
      await act(async () => {
        fireEvent.click(screen.getByTestId('toggle-button'));
      });

      // Verify dark theme is applied
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      });

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });
    });

    it('should toggle multiple times smoothly', async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      });

      // Toggle to dark
      await act(async () => {
        fireEvent.click(screen.getByTestId('toggle-button'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });

      // Toggle back to light
      await act(async () => {
        fireEvent.click(screen.getByTestId('toggle-button'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
        expect(document.documentElement.getAttribute('data-theme')).toBeNull();
      });

      // Toggle to dark again
      await act(async () => {
        fireEvent.click(screen.getByTestId('toggle-button'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });
    });

    it('should set theme directly using setTheme', async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      });

      // Set dark theme directly
      await act(async () => {
        fireEvent.click(screen.getByTestId('set-dark-button'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });

      // Set light theme directly
      await act(async () => {
        fireEvent.click(screen.getByTestId('set-light-button'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
        expect(document.documentElement.getAttribute('data-theme')).toBeNull();
      });
    });
  });

  describe('All colors update correctly', () => {
    it('should apply data-theme attribute for dark mode', async () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });
    });

    it('should remove data-theme attribute for light mode', async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBeNull();
      });
    });

    it('should update data-theme attribute when switching themes', async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      );

      // Start with light theme (no attribute)
      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBeNull();
      });

      // Switch to dark
      await act(async () => {
        fireEvent.click(screen.getByTestId('toggle-button'));
      });

      // Verify dark theme attribute is set
      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });

      // Switch back to light
      await act(async () => {
        fireEvent.click(screen.getByTestId('toggle-button'));
      });

      // Verify attribute is removed
      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBeNull();
      });
    });

    it('should maintain CSS variable structure during theme switch', async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      });

      // Get computed styles in light theme
      const rootStyles = getComputedStyle(document.documentElement);
      const lightPrimary = rootStyles.getPropertyValue('--color-primary');
      
      // Switch to dark theme
      await act(async () => {
        fireEvent.click(screen.getByTestId('toggle-button'));
      });

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });

      // Verify CSS variables are still accessible (structure maintained)
      const darkRootStyles = getComputedStyle(document.documentElement);
      const darkPrimary = darkRootStyles.getPropertyValue('--color-primary');
      
      // Both should have values (even if different)
      expect(lightPrimary).toBeTruthy();
      expect(darkPrimary).toBeTruthy();
    });
  });

  describe('localStorage persistence of theme preference', () => {
    it('should save theme to localStorage when set', async () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(localStorageMock.getItem('theme')).toBe('dark');
      });
    });

    it('should persist theme change to localStorage', async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(localStorageMock.getItem('theme')).toBe('light');
      });

      // Toggle to dark
      await act(async () => {
        fireEvent.click(screen.getByTestId('toggle-button'));
      });

      await waitFor(() => {
        expect(localStorageMock.getItem('theme')).toBe('dark');
      });

      // Toggle back to light
      await act(async () => {
        fireEvent.click(screen.getByTestId('toggle-button'));
      });

      await waitFor(() => {
        expect(localStorageMock.getItem('theme')).toBe('light');
      });
    });

    it('should load saved theme from localStorage on mount', async () => {
      // Pre-set theme in localStorage
      localStorageMock.setItem('theme', 'dark');

      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      );

      // Should load 'dark' from localStorage, not use defaultTheme 'light'
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      });

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });
    });

    it('should use default theme when localStorage is empty', async () => {
      // Ensure localStorage is empty
      localStorageMock.clear();

      render(
        <ThemeProvider defaultTheme="dark">
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      });
    });

    it('should persist theme across multiple toggles', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      );

      // Initial state
      await waitFor(() => {
        expect(localStorageMock.getItem('theme')).toBe('light');
      });

      // Toggle 1: light -> dark
      await act(async () => {
        await user.click(screen.getByTestId('toggle-button'));
      });

      await waitFor(() => {
        expect(localStorageMock.getItem('theme')).toBe('dark');
      });

      // Toggle 2: dark -> light
      await act(async () => {
        await user.click(screen.getByTestId('toggle-button'));
      });

      await waitFor(() => {
        expect(localStorageMock.getItem('theme')).toBe('light');
      });

      // Toggle 3: light -> dark
      await act(async () => {
        await user.click(screen.getByTestId('toggle-button'));
      });

      await waitFor(() => {
        expect(localStorageMock.getItem('theme')).toBe('dark');
      });
    });

    it('should handle invalid localStorage values gracefully', async () => {
      // Set invalid theme value
      localStorageMock.setItem('theme', 'invalid-theme');

      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      );

      // Should fall back to default theme
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      });
    });

    it('should update localStorage when using setTheme directly', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(localStorageMock.getItem('theme')).toBe('light');
      });

      // Set dark theme directly
      await act(async () => {
        await user.click(screen.getByTestId('set-dark-button'));
      });

      await waitFor(() => {
        expect(localStorageMock.getItem('theme')).toBe('dark');
      });

      // Set light theme directly
      await act(async () => {
        await user.click(screen.getByTestId('set-light-button'));
      });

      await waitFor(() => {
        expect(localStorageMock.getItem('theme')).toBe('light');
      });
    });
  });

  describe('Theme consistency', () => {
    it('should maintain theme state consistency between context and DOM', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        const contextTheme = screen.getByTestId('current-theme').textContent;
        const domTheme = document.documentElement.getAttribute('data-theme');
        
        // Light theme: context shows 'light', DOM has no attribute
        expect(contextTheme).toBe('light');
        expect(domTheme).toBeNull();
      });

      // Toggle to dark
      await act(async () => {
        await user.click(screen.getByTestId('toggle-button'));
      });

      await waitFor(() => {
        const contextTheme = screen.getByTestId('current-theme').textContent;
        const domTheme = document.documentElement.getAttribute('data-theme');
        
        // Dark theme: context shows 'dark', DOM has 'dark' attribute
        expect(contextTheme).toBe('dark');
        expect(domTheme).toBe('dark');
      });
    });

    it('should maintain theme state consistency between context, DOM, and localStorage', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        const contextTheme = screen.getByTestId('current-theme').textContent;
        const domTheme = document.documentElement.getAttribute('data-theme');
        const storageTheme = localStorageMock.getItem('theme');
        
        expect(contextTheme).toBe('light');
        expect(domTheme).toBeNull();
        expect(storageTheme).toBe('light');
      });

      // Toggle to dark
      await act(async () => {
        await user.click(screen.getByTestId('toggle-button'));
      });

      await waitFor(() => {
        const contextTheme = screen.getByTestId('current-theme').textContent;
        const domTheme = document.documentElement.getAttribute('data-theme');
        const storageTheme = localStorageMock.getItem('theme');
        
        expect(contextTheme).toBe('dark');
        expect(domTheme).toBe('dark');
        expect(storageTheme).toBe('dark');
      });
    });
  });
});
