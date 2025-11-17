'use client';

import { useEffect, useState } from 'react';
import { validateThemeColors, ThemeColorValidation, logContrastValidation } from '@/lib/utils/color-contrast';

/**
 * Color Contrast Checker Component
 * Requirement: 10.3
 * 
 * Development tool to validate color contrast compliance
 * Only visible in development mode
 */
export function ColorContrastChecker() {
  const [validations, setValidations] = useState<ThemeColorValidation[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return;

    // Get computed CSS variables
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    const getColor = (varName: string): string => {
      return computedStyle.getPropertyValue(varName).trim();
    };

    // Extract theme colors
    const theme = {
      text: getColor('--color-text'),
      textSecondary: getColor('--color-text-secondary'),
      textMuted: getColor('--color-text-muted'),
      background: getColor('--color-background'),
      surface: getColor('--color-surface'),
      primary: getColor('--color-primary'),
      success: getColor('--color-success'),
      warning: getColor('--color-warning'),
      error: getColor('--color-error'),
      info: getColor('--color-info'),
    };

    // Validate colors
    const results = validateThemeColors(theme);
    setValidations(results);

    // Log to console
    logContrastValidation(results);
  }, []);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-md text-xs font-medium shadow-lg"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: '#ffffff',
        }}
        title="Toggle Color Contrast Checker"
      >
        🎨 A11y
      </button>

      {/* Checker Panel */}
      {isVisible && (
        <div
          className="fixed bottom-16 right-4 z-50 w-96 max-h-96 overflow-y-auto rounded-lg shadow-xl"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            className="sticky top-0 px-4 py-3 border-b font-semibold"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            Color Contrast Validation (WCAG 2.1 AA)
          </div>

          <div className="p-4 space-y-3">
            {validations.map((validation, index) => (
              <div
                key={index}
                className="p-3 rounded-md border"
                style={{
                  backgroundColor: validation.passes
                    ? 'var(--color-success-light)'
                    : 'var(--color-error-light)',
                  borderColor: validation.passes
                    ? 'var(--color-success)'
                    : 'var(--color-error)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {validation.name}
                  </span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: validation.passes
                        ? 'var(--color-success)'
                        : 'var(--color-error)',
                      color: '#ffffff',
                    }}
                  >
                    {validation.level}
                  </span>
                </div>

                <div
                  className="text-xs space-y-1"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <div>Ratio: {validation.ratio.toFixed(2)}:1</div>
                  <div>
                    Status: {validation.passes ? '✅ Pass' : '❌ Fail'} (Requires 4.5:1 for text, 3:1 for UI)
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            className="px-4 py-3 border-t text-xs"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div className="flex items-center justify-between">
              <span>
                ✅ {validations.filter(v => v.passes).length} / {validations.length} passed
              </span>
              <span>
                ❌ {validations.filter(v => !v.passes).length} failed
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
