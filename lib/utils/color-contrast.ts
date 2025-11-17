/**
 * Color Contrast Utilities
 * Requirement: 10.3
 * 
 * Utilities for checking and ensuring WCAG 2.1 AA color contrast compliance
 * - Text: 4.5:1 contrast ratio
 * - Large text (18pt+): 3:1 contrast ratio
 * - UI components: 3:1 contrast ratio
 */

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance
 * https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    throw new Error('Invalid color format. Use hex format (#RRGGBB)');
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export function meetsContrastAA(
  foreground: string,
  background: string,
  options: {
    largeText?: boolean;
    uiComponent?: boolean;
  } = {}
): boolean {
  const { largeText = false, uiComponent = false } = options;
  const ratio = getContrastRatio(foreground, background);

  if (uiComponent) {
    return ratio >= 3.0; // WCAG AA for UI components
  }

  if (largeText) {
    return ratio >= 3.0; // WCAG AA for large text (18pt+ or 14pt+ bold)
  }

  return ratio >= 4.5; // WCAG AA for normal text
}

/**
 * Check if contrast ratio meets WCAG AAA standards
 */
export function meetsContrastAAA(
  foreground: string,
  background: string,
  options: {
    largeText?: boolean;
  } = {}
): boolean {
  const { largeText = false } = options;
  const ratio = getContrastRatio(foreground, background);

  if (largeText) {
    return ratio >= 4.5; // WCAG AAA for large text
  }

  return ratio >= 7.0; // WCAG AAA for normal text
}

/**
 * Get contrast level description
 */
export function getContrastLevel(
  foreground: string,
  background: string,
  options: {
    largeText?: boolean;
    uiComponent?: boolean;
  } = {}
): 'AAA' | 'AA' | 'Fail' {
  if (meetsContrastAAA(foreground, background, options)) {
    return 'AAA';
  }
  if (meetsContrastAA(foreground, background, options)) {
    return 'AA';
  }
  return 'Fail';
}

/**
 * Validate theme colors for contrast compliance
 */
export interface ThemeColorValidation {
  name: string;
  foreground: string;
  background: string;
  ratio: number;
  level: 'AAA' | 'AA' | 'Fail';
  passes: boolean;
}

export function validateThemeColors(theme: {
  text: string;
  textSecondary: string;
  textMuted: string;
  background: string;
  surface: string;
  primary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}): ThemeColorValidation[] {
  const validations: ThemeColorValidation[] = [];

  // Text on background
  validations.push({
    name: 'Text on Background',
    foreground: theme.text,
    background: theme.background,
    ratio: getContrastRatio(theme.text, theme.background),
    level: getContrastLevel(theme.text, theme.background),
    passes: meetsContrastAA(theme.text, theme.background),
  });

  // Secondary text on background
  validations.push({
    name: 'Secondary Text on Background',
    foreground: theme.textSecondary,
    background: theme.background,
    ratio: getContrastRatio(theme.textSecondary, theme.background),
    level: getContrastLevel(theme.textSecondary, theme.background),
    passes: meetsContrastAA(theme.textSecondary, theme.background),
  });

  // Text on surface
  validations.push({
    name: 'Text on Surface',
    foreground: theme.text,
    background: theme.surface,
    ratio: getContrastRatio(theme.text, theme.surface),
    level: getContrastLevel(theme.text, theme.surface),
    passes: meetsContrastAA(theme.text, theme.surface),
  });

  // White text on primary (buttons)
  validations.push({
    name: 'White on Primary',
    foreground: '#ffffff',
    background: theme.primary,
    ratio: getContrastRatio('#ffffff', theme.primary),
    level: getContrastLevel('#ffffff', theme.primary),
    passes: meetsContrastAA('#ffffff', theme.primary),
  });

  // Status colors on background
  const statusColors = [
    { name: 'Success', color: theme.success },
    { name: 'Warning', color: theme.warning },
    { name: 'Error', color: theme.error },
    { name: 'Info', color: theme.info },
  ];

  statusColors.forEach(({ name, color }) => {
    validations.push({
      name: `${name} on Background`,
      foreground: color,
      background: theme.background,
      ratio: getContrastRatio(color, theme.background),
      level: getContrastLevel(color, theme.background, { uiComponent: true }),
      passes: meetsContrastAA(color, theme.background, { uiComponent: true }),
    });
  });

  return validations;
}

/**
 * Log contrast validation results to console
 */
export function logContrastValidation(validations: ThemeColorValidation[]): void {
  console.group('🎨 Color Contrast Validation (WCAG 2.1 AA)');
  
  const passed = validations.filter(v => v.passes);
  const failed = validations.filter(v => !v.passes);
  
  console.log(`✅ Passed: ${passed.length}/${validations.length}`);
  console.log(`❌ Failed: ${failed.length}/${validations.length}`);
  
  if (failed.length > 0) {
    console.group('❌ Failed Validations');
    failed.forEach(v => {
      console.log(`${v.name}: ${v.ratio.toFixed(2)}:1 (${v.level}) - Requires 4.5:1 for AA`);
    });
    console.groupEnd();
  }
  
  if (passed.length > 0) {
    console.group('✅ Passed Validations');
    passed.forEach(v => {
      console.log(`${v.name}: ${v.ratio.toFixed(2)}:1 (${v.level})`);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
}
