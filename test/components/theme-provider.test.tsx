import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { vi } from 'vitest';
import { beforeEach } from 'vitest';
import { describe } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    document.documentElement.removeAttribute('data-theme');
  });

  it('should render children', () => {
    render(
      <ThemeProvider>
        <div data-testid="test-child">Test Content</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render with default theme', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <div data-testid="test-child">Test Content</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('should handle localStorage access', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    render(
      <ThemeProvider>
        <div data-testid="test-child">Test Content</div>
      </ThemeProvider>
    );

    expect(localStorageMock.getItem).toHaveBeenCalledWith('theme');
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });
});