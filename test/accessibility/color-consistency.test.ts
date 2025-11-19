/**
 * Color Usage Consistency Tests
 * Requirements: 2.1, 2.2, 2.3
 * 
 * This test suite verifies that colors are used consistently across the application
 * and that all color variables are properly defined.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Color Consistency Tests', () => {
  let cssContent: string;

  beforeAll(() => {
    // Read the globals.css file
    const cssPath = resolve(__dirname, '../../app/globals.css');
    cssContent = readFileSync(cssPath, 'utf-8');
  });

  describe('Required Color Variables (Requirement 2.1)', () => {
    const requiredVariables = [
      // Primary colors
      '--color-primary',
      '--color-primary-hover',
      '--color-primary-active',
      
      // Background colors
      '--color-background',
      '--color-bg',
      '--color-bg-secondary',
      '--color-bg-tertiary',
      
      // Text colors
      '--color-text',
      '--color-text-secondary',
      '--color-text-muted',
      '--color-foreground',
      
      // Surface colors
      '--color-surface',
      '--color-surface-hover',
      
      // Border colors
      '--color-border',
      '--color-border-light',
      
      // Status colors
      '--color-success',
      '--color-success-light',
      '--color-warning',
      '--color-warning-light',
      '--color-error',
      '--color-error-light',
      '--color-info',
      '--color-info-light',
    ];

    it.each(requiredVariables)('should define %s in light theme', (variable) => {
      const rootRegex = new RegExp(`:root\\s*{[^}]*${variable}\\s*:[^;]+;`, 's');
      expect(cssContent).toMatch(rootRegex);
    });

    it.each(requiredVariables)('should define %s in dark theme', (variable) => {
      const darkRegex = new RegExp(`\\[data-theme="dark"\\]\\s*{[^}]*${variable}\\s*:[^;]+;`, 's');
      expect(cssContent).toMatch(darkRegex);
    });
  });

  describe('Color Variable Format (Requirement 2.2)', () => {
    it('should use hex color format for all color variables', () => {
      // Extract all color variable definitions
      const colorVarRegex = /--(color-[a-z-]+):\s*([^;]+);/g;
      const matches = [...cssContent.matchAll(colorVarRegex)];
      
      matches.forEach(([, varName, value]) => {
        const trimmedValue = value.trim();
        // Should be a hex color (e.g., #ffffff)
        if (!trimmedValue.startsWith('var(')) {
          expect(trimmedValue).toMatch(/^#[0-9a-fA-F]{6}$/);
        }
      });
    });

    it('should not have duplicate color variable definitions in same theme', () => {
      // Check for duplicates in :root
      const rootSection = cssContent.match(/:root\s*{([^}]*)}/s)?.[1] || '';
      const rootVars = [...rootSection.matchAll(/--color-[a-z-]+/g)].map(m => m[0]);
      const uniqueRootVars = new Set(rootVars);
      expect(rootVars.length).toBe(uniqueRootVars.size);

      // Check for duplicates in dark theme
      const darkSection = cssContent.match(/\[data-theme="dark"\]\s*{([^}]*)}/s)?.[1] || '';
      const darkVars = [...darkSection.matchAll(/--color-[a-z-]+/g)].map(m => m[0]);
      const uniqueDarkVars = new Set(darkVars);
      expect(darkVars.length).toBe(uniqueDarkVars.size);
    });
  });

  describe('Theme Parity (Requirement 2.3)', () => {
    it('should have same color variables in both light and dark themes', () => {
      // Extract variables from :root
      const rootSection = cssContent.match(/:root\s*{([^}]*)}/s)?.[1] || '';
      const rootVars = new Set(
        [...rootSection.matchAll(/--color-[a-z-]+/g)].map(m => m[0])
      );

      // Extract variables from dark theme
      const darkSection = cssContent.match(/\[data-theme="dark"\]\s*{([^}]*)}/s)?.[1] || '';
      const darkVars = new Set(
        [...darkSection.matchAll(/--color-[a-z-]+/g)].map(m => m[0])
      );

      // Both themes should have the same variables
      expect([...rootVars].sort()).toEqual([...darkVars].sort());
    });
  });

  describe('Color Naming Conventions (Requirement 2.1)', () => {
    it('should use semantic color names', () => {
      const semanticPrefixes = [
        'primary',
        'background',
        'bg',
        'text',
        'foreground',
        'surface',
        'border',
        'success',
        'warning',
        'error',
        'info',
      ];

      const colorVarRegex = /--(color-([a-z-]+))/g;
      const matches = [...cssContent.matchAll(colorVarRegex)];
      
      matches.forEach(([, fullVar, baseName]) => {
        const hasSemanticPrefix = semanticPrefixes.some(prefix => 
          baseName.startsWith(prefix)
        );
        expect(hasSemanticPrefix).toBe(true);
      });
    });

    it('should not use color names in variable names', () => {
      // Variables should not be named after colors (e.g., --color-blue)
      const colorNames = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'gray', 'grey'];
      const colorVarRegex = /--(color-[a-z-]+)/g;
      const matches = [...cssContent.matchAll(colorVarRegex)];
      
      matches.forEach(([fullVar]) => {
        colorNames.forEach(colorName => {
          expect(fullVar).not.toContain(`-${colorName}`);
        });
      });
    });
  });

  describe('Status Color Consistency (Requirement 2.2)', () => {
    it('should have both solid and light variants for all status colors', () => {
      const statusTypes = ['success', 'warning', 'error', 'info'];
      
      statusTypes.forEach(status => {
        // Check for solid variant
        expect(cssContent).toMatch(new RegExp(`--color-${status}\\s*:`));
        // Check for light variant
        expect(cssContent).toMatch(new RegExp(`--color-${status}-light\\s*:`));
      });
    });
  });

  describe('Color Value Validation', () => {
    it('should not use rgb() or rgba() format', () => {
      const colorVarRegex = /--(color-[a-z-]+):\s*([^;]+);/g;
      const matches = [...cssContent.matchAll(colorVarRegex)];
      
      matches.forEach(([, varName, value]) => {
        expect(value.trim()).not.toMatch(/^rgba?\(/);
      });
    });

    it('should not use hsl() or hsla() format', () => {
      const colorVarRegex = /--(color-[a-z-]+):\s*([^;]+);/g;
      const matches = [...cssContent.matchAll(colorVarRegex)];
      
      matches.forEach(([, varName, value]) => {
        expect(value.trim()).not.toMatch(/^hsla?\(/);
      });
    });
  });

  describe('Documentation', () => {
    it('should document all color variables', () => {
      console.log('\n=== COLOR VARIABLES INVENTORY ===\n');
      
      // Extract and display all color variables from light theme
      const rootSection = cssContent.match(/:root\s*{([^}]*)}/s)?.[1] || '';
      const rootVars = [...rootSection.matchAll(/--(color-[a-z-]+):\s*([^;]+);/g)];
      
      console.log('Light Theme Colors:');
      rootVars.forEach(([, varName, value]) => {
        console.log(`  ${varName}: ${value.trim()}`);
      });
      
      // Extract and display all color variables from dark theme
      const darkSection = cssContent.match(/\[data-theme="dark"\]\s*{([^}]*)}/s)?.[1] || '';
      const darkVars = [...darkSection.matchAll(/--(color-[a-z-]+):\s*([^;]+);/g)];
      
      console.log('\nDark Theme Colors:');
      darkVars.forEach(([, varName, value]) => {
        console.log(`  ${varName}: ${value.trim()}`);
      });
      
      expect(rootVars.length).toBeGreaterThan(0);
      expect(darkVars.length).toBeGreaterThan(0);
    });
  });
});
