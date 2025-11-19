'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChangePasswordForm } from '@/components/profile';
import { ChangePasswordInput } from '@/lib/validations/user-schemas';
import { useNotification } from '@/lib/contexts/notification-context';
import { ErrorBoundary } from '@/components/ui/error-boundary';

/**
 * Change Password Page
 * Allow users to change their password
 * Requirements: 8.1-8.7, 9.2, 10.1-10.4
 */
function ChangePasswordPageContent() {
  const router = useRouter();
  const { showSuccess, showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle password change
  const handleChangePassword = async (data: ChangePasswordInput) => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
      }

      // Show success notification
      showSuccess('สำเร็จ', 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');

      // Redirect to profile page after 1.5 seconds
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err) {
      console.error('Error changing password:', err);
      showError('เกิดข้อผิดพลาด', err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/profile');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={handleCancel}
            className="text-sm hover:opacity-80 transition-opacity"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label="กลับไปหน้าโปรไฟล์"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            เปลี่ยนรหัสผ่าน
          </h1>
        </div>
        <p className="text-sm ml-7" style={{ color: 'var(--color-text-secondary)' }}>
          เปลี่ยนรหัสผ่านของคุณเพื่อรักษาความปลอดภัยของบัญชี
        </p>
      </div>

      {/* Change Password Form */}
      <ChangePasswordForm
        onSubmit={handleChangePassword}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <ErrorBoundary>
      <ChangePasswordPageContent />
    </ErrorBoundary>
  );
}
