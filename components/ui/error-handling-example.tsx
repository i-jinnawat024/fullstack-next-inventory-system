'use client';

import { useState } from 'react';
import { Package, AlertCircle } from 'lucide-react';
import { InlineError } from './inline-error';
import { EmptyState } from './empty-state';
import { ErrorState } from './error-state';
import { ErrorBoundary } from './error-boundary';
import { SectionErrorBoundary } from './section-error-boundary';
import { Button } from './button';
import { TextInput } from '@/components/forms/text-input';

/**
 * Example demonstrating all error handling components
 * This file shows how to use the error handling system in different scenarios
 */

// Component that throws an error for testing error boundaries
function ErrorThrowingComponent(): null {
  throw new Error('This is a test error from ErrorThrowingComponent');
  return null;
}

export function ErrorHandlingExample() {
  const [showError, setShowError] = useState(false);
  const [formError, setFormError] = useState('');
  const [inputValue, setInputValue] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue) {
      setFormError('กรุณากรอกข้อมูล');
    } else {
      setFormError('');
      alert('Form submitted successfully!');
    }
  };

  return (
    <div className="p-8 space-y-12">
      <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
        Error Handling Examples
      </h1>

      {/* 1. Inline Error Example */}
      <section>
        <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          1. Inline Error (Form Validation)
        </h2>
        <form onSubmit={handleFormSubmit} className="max-w-md">
          <div className="mb-4">
            <label className="block mb-2" style={{ color: 'var(--color-text)' }}>
              ชื่อสินค้า
            </label>
            <TextInput
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (formError) setFormError('');
              }}
              error={!!formError}
              placeholder="กรอกชื่อสินค้า"
            />
            {formError && <InlineError message={formError} />}
          </div>
          <Button type="submit" variant="primary">
            ส่งข้อมูล
          </Button>
        </form>
      </section>

      {/* 2. Empty State Example */}
      <section>
        <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          2. Empty State (No Data)
        </h2>
        <div
          className="border rounded-lg p-4"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <EmptyState
            icon={<Package className="w-12 h-12" />}
            title="ไม่มีสินค้า"
            description="ยังไม่มีสินค้าในระบบ กรุณาเพิ่มสินค้าใหม่"
            action={{
              label: 'เพิ่มสินค้า',
              onClick: () => alert('Navigate to add product page'),
            }}
          />
        </div>
      </section>

      {/* 3. Error State Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          3. Error State (Data Fetching Errors)
        </h2>

        <div className="space-y-6">
          {/* Inline variant */}
          <div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              Inline Variant
            </h3>
            <ErrorState
              variant="inline"
              message="ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง"
              onRetry={() => alert('Retrying...')}
            />
          </div>

          {/* Card variant */}
          <div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              Card Variant
            </h3>
            <ErrorState
              variant="card"
              title="เกิดข้อผิดพลาด"
              message="ไม่สามารถโหลดรายการสินค้าได้ กรุณาลองใหม่อีกครั้ง"
              onRetry={() => alert('Retrying...')}
            />
          </div>

          {/* Page variant */}
          <div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text)' }}>
              Page Variant
            </h3>
            <div className="border rounded-lg" style={{ borderColor: 'var(--color-border)' }}>
              <ErrorState
                variant="page"
                title="เกิดข้อผิดพลาด"
                message="ไม่สามารถโหลดหน้านี้ได้ กรุณาลองใหม่อีกครั้ง"
                onRetry={() => alert('Retrying...')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section Error Boundary Example */}
      <section>
        <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          4. Section Error Boundary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Working section */}
          <SectionErrorBoundary sectionName="Working Section">
            <div
              className="p-6 rounded-lg"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--color-border)',
              }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Working Section
              </h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                This section works fine and displays content normally.
              </p>
            </div>
          </SectionErrorBoundary>

          {/* Error section */}
          <SectionErrorBoundary sectionName="Error Section">
            <div
              className="p-6 rounded-lg"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--color-border)',
              }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Error Section
              </h3>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowError(true)}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Trigger Error
              </Button>
              {showError && <ErrorThrowingComponent />}
            </div>
          </SectionErrorBoundary>
        </div>
      </section>

      {/* 5. Full Error Boundary Example */}
      <section>
        <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          5. Full Error Boundary
        </h2>
        <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          The entire application is wrapped in an ErrorBoundary at the root level.
          This catches any unhandled errors and displays a full-page error screen.
        </p>
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: 'var(--color-surface-hover)',
          }}
        >
          <code style={{ color: 'var(--color-text)' }}>
            {'<ErrorBoundary>'}
            <br />
            {'  <App />'}
            <br />
            {'</ErrorBoundary>'}
          </code>
        </div>
      </section>

      {/* Usage Tips */}
      <section>
        <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          Usage Tips
        </h2>
        <div
          className="p-6 rounded-lg space-y-3"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--color-border)',
          }}
        >
          <div>
            <strong style={{ color: 'var(--color-text)' }}>InlineError:</strong>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {' '}Use for form validation errors below input fields
            </span>
          </div>
          <div>
            <strong style={{ color: 'var(--color-text)' }}>EmptyState:</strong>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {' '}Use when there's no data to display (empty tables, lists)
            </span>
          </div>
          <div>
            <strong style={{ color: 'var(--color-text)' }}>ErrorState:</strong>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {' '}Use for data fetching errors with retry functionality
            </span>
          </div>
          <div>
            <strong style={{ color: 'var(--color-text)' }}>SectionErrorBoundary:</strong>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {' '}Use to wrap independent sections (dashboard widgets, charts)
            </span>
          </div>
          <div>
            <strong style={{ color: 'var(--color-text)' }}>ErrorBoundary:</strong>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {' '}Use at the root level or for critical sections
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
