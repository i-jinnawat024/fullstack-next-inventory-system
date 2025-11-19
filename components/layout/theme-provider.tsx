'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Theme, ThemeContextType } from '@/lib/types/theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'light' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount (Requirement 11.3, 11.6)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setThemeState(savedTheme);
    } else {
      // Set light mode as default (Requirement 11.1)
      setThemeState('light');
    }
    setMounted(true);
  }, []);

  // Apply theme to document with smooth transitions (Requirement 11.4)
  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;
      
      // Apply theme attribute
      if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
      
      // Persist theme preference (Requirement 11.3)
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
