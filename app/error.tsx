'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging
    console.error('Application error:', error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div
        className="max-w-md w-full rounded-lg p-8"
        style={{
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div
          className="flex items-center justify-center w-16 h-16 mx-auto rounded-full mb-6"
          style={{
            backgroundColor: 'var(--color-error)',
            opacity: 0.1,
          }}
        >
          <AlertTriangle
            className="w-8 h-8"
            style={{ color: 'var(--color-error)' }}
            aria-hidden="true"
          />
        </div>
        <h2
          className="text-2xl font-semibold text-center mb-3"
          style={{ color: 'var(--color-text)' }}
        >
          เกิดข้อผิดพลาด
        </h2>
        <p
          className="text-center text-base mb-6"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          ขออภัย เกิดข้อผิดพลาดในการแสดงผล กรุณาลองใหม่อีกครั้ง
        </p>
        {error.message && process.env.NODE_ENV === 'development' && (
          <div
            className="mt-4 p-4 rounded-lg text-xs overflow-auto max-h-32"
            style={{
              backgroundColor: 'var(--color-surface-hover)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <pre className="whitespace-pre-wrap break-words">{error.message}</pre>
            {error.digest && (
              <p className="mt-2 text-xs opacity-70">Digest: {error.digest}</p>
            )}
          </div>
        )}
        <div className="flex flex-col gap-3 mt-6">
          <Button onClick={reset} variant="primary" fullWidth>
            <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
            ลองอีกครั้ง
          </Button>
          <Link href="/dashboard">
            <Button variant="secondary" fullWidth>
              <Home className="w-4 h-4 mr-2" aria-hidden="true" />
              กลับหน้าหลัก
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
