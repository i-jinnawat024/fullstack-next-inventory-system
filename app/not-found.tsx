import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
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
              backgroundColor: 'var(--color-surface-hover)',
            }}
          >
            <FileQuestion
              className="w-12 h-12"
              style={{ color: 'var(--color-text-muted)' }}
              aria-hidden="true"
            />
          </div>
          <h1
            className="text-9xl font-bold mb-4"
            style={{ color: 'var(--color-border)' }}
            aria-label="404"
          >
            404
          </h1>
          <h2
            className="text-2xl font-semibold mb-3"
            style={{ color: 'var(--color-text)' }}
          >
            ไม่พบหน้าที่ต้องการ
          </h2>
          <p
            className="text-base mb-8"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            ขออภัย ไม่พบหน้าที่คุณกำลังค้นหา หน้านี้อาจถูกย้ายหรือลบไปแล้ว
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="primary" size="lg">
            <Home className="w-5 h-5 mr-2" aria-hidden="true" />
            กลับหน้าหลัก
          </Button>
        </Link>
      </div>
    </div>
  );
}
