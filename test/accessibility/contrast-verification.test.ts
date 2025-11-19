/**
 * Accessibility Contrast Verification Tests
 * Requirements: 2.1, 2.2, 2.3, 2.4
 * 
 * This test suite verifies that all color combinations meet WCAG 2.1 AA standards:
 * - Text colors must have at least 4.5:1 contrast ratio
 * - UI components must have at least 3:1 contrast ratio
 */

import { describe, it, expect } from 'vitest';

// Color conversion utilities
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Light Theme Colors
const lightTheme = {
  primary: '#475569',
  primaryHover: '#334155',
  primaryActive: '#1e293b',
  background: '#ffffff',
  bgSecondary: '#f8fafc',
  bgTertiary: '#f1f5f9',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  surface: '#ffffff',
  surfaceHover: '#f8fafc',
  border: '#cbd5e1',
  borderLight: '#e2e8f0',
  success: '#059669',
  successLight: '#d1fae5',
  warning: '#d97706',
  warningLight: '#fef3c7',
  error: '#dc2626',
  errorLight: '#fee2e2',
  info: '#0891b2',
  infoLight: '#cffafe',
};

// Dark Theme Colors
const darkTheme = {
  primary: '#94a3b8',
  primaryHover: '#cbd5e1',
  primaryActive: '#e2e8f0',
  background: '#0f172a',
  bgSecondary: '#1e293b',
  bgTertiary: '#334155',
  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  surface: '#1e293b',
  surfaceHover: '#334155',
  border: '#475569',
  borderLight: '#334155',
  success: '#34d399',
  successLight: '#064e3b',
  warning: '#fbbf24',
  warningLight: '#78350f',
  error: '#f87171',
  errorLight: '#7f1d1d',
  info: '#22d3ee',
  infoLight: '#164e63',
};

describe('Accessibility Contrast Verification - Light Theme', () => {
  describe('Text Colors on Backgrounds (Requirement 2.1, 2.4)', () => {
    it('should have primary text meet 4.5:1 contrast on white background', () => {
      const ratio = getContrastRatio(lightTheme.text, lightTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`✓ Primary text on white: ${ratio.toFixed(2)}:1`);
    });

    it('should have secondary text meet 4.5:1 contrast on white background', () => {
      const ratio = getContrastRatio(lightTheme.textSecondary, lightTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`✓ Secondary text on white: ${ratio.toFixed(2)}:1`);
    });

    it('should have muted text meet 4.5:1 contrast on white background', () => {
      const ratio = getContrastRatio(lightTheme.textMuted, lightTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`✓ Muted text on white: ${ratio.toFixed(2)}:1`);
    });

    it('should have primary text meet 4.5:1 contrast on secondary background', () => {
      const ratio = getContrastRatio(lightTheme.text, lightTheme.bgSecondary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`✓ Primary text on secondary bg: ${ratio.toFixed(2)}:1`);
    });

    it('should have primary text meet 4.5:1 contrast on tertiary background', () => {
      const ratio = getContrastRatio(lightTheme.text, lightTheme.bgTertiary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`✓ Primary text on tertiary bg: ${ratio.toFixed(2)}:1`);
    });

    it('should have primary text meet 4.5:1 contrast on surface', () => {
      const ratio = getContrastRatio(lightTheme.text, lightTheme.surface);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`✓ Primary text on surface: ${ratio.toFixed(2)}:1`);
    });
  });

  describe('Interactive Elements (Requirement 2.2, 2.3)', () => {
    it('should have primary color meet 4.5:1 contrast on white background', () => {
      const ratio = getContrastRatio(lightTheme.primary, lightTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`✓ Primary color on white: ${ratio.toFixed(2)}:1`);
    });

    it('should have primary hover meet 4.5:1 contrast on white background', () => {
      const ratio = getContrastRatio(lightTheme.primaryHover, lightTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`✓ Primary hover on white: ${ratio.toFixed(2)}:1`);
    });

    it('should have primary active meet 4.5:1 contrast on white background', () => {
      const ratio = getContrastRatio(lightTheme.primaryActive, lightTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`✓ Primary active on white: ${ratio.toFixed(2)}:1`);
    });
  });

  describe('UI Components and Borders (Requirement 2.2)', () => {
    it('should have border meet 3:1 contrast on white background', () => {
      const ratio = getContrastRatio(lightTheme.border, lightTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      console.log(`✓ Border on white: ${ratio.toFixed(2)}:1`);
    });

    it('should have border light meet 3:1 contrast on white background', () => {
      const ratio = getContrastRatio(lightTheme.borderLight, lightTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      console.log(`✓ Border light on white: ${ratio.toFixed(2)}:1`);
    });
  });

  describe('Status Colors (Requirement 2.2)', () => {
    it('should have success color meet 3:1 contrast on white background', () => {
      const ratio = getContrastRatio(lightTheme.success, lightTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      console.log(`✓ Success on white: ${ratio.toFixed(2)}:1`);
    });

    it('should have warning color meet 3:1 contrast on white background', () => {
      const ratio = getContrastRatio(lightTheme.warning, lightTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      console.log(`✓ Warning on white: ${ratio.toFixed(2)}:1`);
    });

    it('should have error color meet 3:1 contrast on white background', () => {
      const ratio = getContrastRatio(lightTheme.error, lightTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      console.log(`✓ Error on white: ${ratio.toFixed(2)}:1`);
    });

    it('should have info color meet 3:1 contrast on white background', () => {
      const ratio = getContrastRatio(lightTheme.info, lightTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      console.log(`✓ Info on white: ${ratio.toFixed(2)}:1`);
    });
  });
});

describe('Accessibility Contrast Verification - Dark Theme', () => {
  describe('Text Colors on Backgrounds (Requirement 2.1, 2.4)', () => {
    it('should have primary text meet 4.5:1 contrast on dark background', () => {
      const ratio = getContrastRatio(darkTheme.text, darkTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`✓ Primary text on dark: ${ratio.toFixed(2)}:1`);
    });

    it('should have secondary text meet 4.5:1 contrast on dark background', () => {
      const ratio = getContrastRatio(darkTheme.textSecondary, darkTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`✓ Secondary text on dark: ${ratio.toFixed(2)}:1`);
    });

    it('should have muted text meet 4.5:1 contrast on dark background', () => {
      const ratio = getContrastRatio(darkTheme.textMuted, darkTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`✓ Muted text on dark: ${ratio.toFixed(2)}:1`);
    });

    it('should have primary text meet 4.5:1 contrast on secondary background', () => {
      const ratio = getContrastRatio(darkTheme.text, darkTheme.bgSecondary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`✓ Primary text on secondary bg: ${ratio.toFixed(2)}:1`);
    });

    it('should have primary text meet 4.5:1 contrast on tertiary background', () => {
      const ratio = getContrastRatio(darkTheme.text, darkTheme.bgTertiary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`✓ Primary text on tertiary bg: ${ratio.toFixed(2)}:1`);
    });

    it('should have primary text meet 4.5:1 contrast on surface', () => {
      const ratio = getContrastRatio(darkTheme.text, darkTheme.surface);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`✓ Primary text on surface: ${ratio.toFixed(2)}:1`);
    });
  });

  describe('Interactive Elements (Requirement 2.2, 2.3)', () => {
    it('should have primary color meet 4.5:1 contrast on dark background', () => {
      const ratio = getContrastRatio(darkTheme.primary, darkTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`✓ Primary color on dark: ${ratio.toFixed(2)}:1`);
    });

    it('should have primary hover meet 4.5:1 contrast on dark background', () => {
      const ratio = getContrastRatio(darkTheme.primaryHover, darkTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`✓ Primary hover on dark: ${ratio.toFixed(2)}:1`);
    });

    it('should have primary active meet 4.5:1 contrast on dark background', () => {
      const ratio = getContrastRatio(darkTheme.primaryActive, darkTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      console.log(`✓ Primary active on dark: ${ratio.toFixed(2)}:1`);
    });
  });

  describe('UI Components and Borders (Requirement 2.2)', () => {
    it('should have border meet 3:1 contrast on dark background', () => {
      const ratio = getContrastRatio(darkTheme.border, darkTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      console.log(`✓ Border on dark: ${ratio.toFixed(2)}:1`);
    });

    it('should have border light meet 3:1 contrast on dark background', () => {
      const ratio = getContrastRatio(darkTheme.borderLight, darkTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      console.log(`✓ Border light on dark: ${ratio.toFixed(2)}:1`);
    });
  });

  describe('Status Colors (Requirement 2.2)', () => {
    it('should have success color meet 3:1 contrast on dark background', () => {
      const ratio = getContrastRatio(darkTheme.success, darkTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      console.log(`✓ Success on dark: ${ratio.toFixed(2)}:1`);
    });

    it('should have warning color meet 3:1 contrast on dark background', () => {
      const ratio = getContrastRatio(darkTheme.warning, darkTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      console.log(`✓ Warning on dark: ${ratio.toFixed(2)}:1`);
    });

    it('should have error color meet 3:1 contrast on dark background', () => {
      const ratio = getContrastRatio(darkTheme.error, darkTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      console.log(`✓ Error on dark: ${ratio.toFixed(2)}:1`);
    });

    it('should have info color meet 3:1 contrast on dark background', () => {
      const ratio = getContrastRatio(darkTheme.info, darkTheme.background);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      console.log(`✓ Info on dark: ${ratio.toFixed(2)}:1`);
    });
  });
});

describe('Comprehensive Contrast Documentation', () => {
  it('should document all contrast ratios for light theme', () => {
    console.log('\n=== LIGHT THEME CONTRAST RATIOS ===\n');
    
    console.log('Text Colors:');
    console.log(`  text on background: ${getContrastRatio(lightTheme.text, lightTheme.background).toFixed(2)}:1`);
    console.log(`  text-secondary on background: ${getContrastRatio(lightTheme.textSecondary, lightTheme.background).toFixed(2)}:1`);
    console.log(`  text-muted on background: ${getContrastRatio(lightTheme.textMuted, lightTheme.background).toFixed(2)}:1`);
    
    console.log('\nPrimary Colors:');
    console.log(`  primary on background: ${getContrastRatio(lightTheme.primary, lightTheme.background).toFixed(2)}:1`);
    console.log(`  primary-hover on background: ${getContrastRatio(lightTheme.primaryHover, lightTheme.background).toFixed(2)}:1`);
    console.log(`  primary-active on background: ${getContrastRatio(lightTheme.primaryActive, lightTheme.background).toFixed(2)}:1`);
    
    console.log('\nBorders:');
    console.log(`  border on background: ${getContrastRatio(lightTheme.border, lightTheme.background).toFixed(2)}:1`);
    console.log(`  border-light on background: ${getContrastRatio(lightTheme.borderLight, lightTheme.background).toFixed(2)}:1`);
    
    console.log('\nStatus Colors:');
    console.log(`  success on background: ${getContrastRatio(lightTheme.success, lightTheme.background).toFixed(2)}:1`);
    console.log(`  warning on background: ${getContrastRatio(lightTheme.warning, lightTheme.background).toFixed(2)}:1`);
    console.log(`  error on background: ${getContrastRatio(lightTheme.error, lightTheme.background).toFixed(2)}:1`);
    console.log(`  info on background: ${getContrastRatio(lightTheme.info, lightTheme.background).toFixed(2)}:1`);
    
    expect(true).toBe(true);
  });

  it('should document all contrast ratios for dark theme', () => {
    console.log('\n=== DARK THEME CONTRAST RATIOS ===\n');
    
    console.log('Text Colors:');
    console.log(`  text on background: ${getContrastRatio(darkTheme.text, darkTheme.background).toFixed(2)}:1`);
    console.log(`  text-secondary on background: ${getContrastRatio(darkTheme.textSecondary, darkTheme.background).toFixed(2)}:1`);
    console.log(`  text-muted on background: ${getContrastRatio(darkTheme.textMuted, darkTheme.background).toFixed(2)}:1`);
    
    console.log('\nPrimary Colors:');
    console.log(`  primary on background: ${getContrastRatio(darkTheme.primary, darkTheme.background).toFixed(2)}:1`);
    console.log(`  primary-hover on background: ${getContrastRatio(darkTheme.primaryHover, darkTheme.background).toFixed(2)}:1`);
    console.log(`  primary-active on background: ${getContrastRatio(darkTheme.primaryActive, darkTheme.background).toFixed(2)}:1`);
    
    console.log('\nBorders:');
    console.log(`  border on background: ${getContrastRatio(darkTheme.border, darkTheme.background).toFixed(2)}:1`);
    console.log(`  border-light on background: ${getContrastRatio(darkTheme.borderLight, darkTheme.background).toFixed(2)}:1`);
    
    console.log('\nStatus Colors:');
    console.log(`  success on background: ${getContrastRatio(darkTheme.success, darkTheme.background).toFixed(2)}:1`);
    console.log(`  warning on background: ${getContrastRatio(darkTheme.warning, darkTheme.background).toFixed(2)}:1`);
    console.log(`  error on background: ${getContrastRatio(darkTheme.error, darkTheme.background).toFixed(2)}:1`);
    console.log(`  info on background: ${getContrastRatio(darkTheme.info, darkTheme.background).toFixed(2)}:1`);
    
    expect(true).toBe(true);
  });
});
