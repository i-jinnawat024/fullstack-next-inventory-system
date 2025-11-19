import Link from 'next/link';
import { ServerCrash, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InternalServerError() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div
            className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
            style={{
              backgroundColor: 'var(--color-error)',
              opacity: 0.1,
            }}
          >
            <ServerCrash
              className="w-12 h-12"
              style={{ color: 'var(--color-error)' }}
              aria-hidden="true"
            />
          </div>
          <h1
            className="text-9xl font-bold mb-4"
            style={{ color: 'var(--color-border)' }}
            aria-label="500"
          >
            500
          </h1>
          <h2
            className="text-2xl font-semibold mb-3"
            style={{ color: 'var(--color-text)' }}
          >
            เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
          </h2>
          <p
            className="text-base mb-8"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            ขออภัย เกิดข้อผิดพลาดในการประมวลผลคำขอของคุณ กรุณาลองใหม่อีกครั้งในภายหลัง
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => window.location.reload()}
            variant="primary"
            size="lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" aria-hidden="true" />
            โหลดหน้าใหม่
          </Button>
          <Link href="/dashboard">
            <Button variant="secondary" size="lg">
              <Home className="w-5 h-5 mr-2" aria-hidden="true" />
              กลับหน้าหลัก
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
