'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateUserInput } from '@/lib/validations/user-schemas';
import { UserForm } from '@/components/admin';
import { useNotification } from '@/lib/contexts/notification-context';
import { ErrorBoundary } from '@/components/ui/error-boundary';

function NewUserPageContent() {
  const router = useRouter();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreateUserInput | any) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน');
      }

      // Success - show notification and redirect
      showSuccess('สำเร็จ', 'เพิ่มผู้ใช้งานใหม่เรียบร้อยแล้ว');
      setTimeout(() => {
        router.push('/admin/users');
      }, 1000);
    } catch (err) {
      console.error('Error creating user:', err);
      showError('เกิดข้อผิดพลาด', err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
      throw err; // Re-throw to let form handle it
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/users');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          เพิ่มผู้ใช้งานใหม่
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          กรอกข้อมูลผู้ใช้งานใหม่
        </p>
      </div>

      {/* Form */}
      <div
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <UserForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={loading}
        />
      </div>
    </div>
  );
}

export default function NewUserPage() {
  return (
    <ErrorBoundary>
      <NewUserPageContent />
    </ErrorBoundary>
  );
}
