'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserResponse } from '@/lib/types/user-management';
import { UpdateUserInput, ResetPasswordInput } from '@/lib/validations/user-schemas';
import { UserForm, UserDetails, PasswordResetForm } from '@/components/admin';
import { useNotification } from '@/lib/contexts/notification-context';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

function EditUserPageContent() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { showSuccess, showError } = useNotification();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Fetch user details
  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`);

      if (response.status === 401 || response.status === 403) {
        showError('ไม่มีสิทธิ์เข้าถึง', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        router.push('/');
        return;
      }

      if (response.status === 404) {
        showError('ไม่พบข้อมูล', 'ไม่พบข้อมูลผู้ใช้งาน');
        setUser(null);
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }

      const userData = result.data || result.user;
      setUser(userData);
    } catch (err) {
      console.error('Error fetching user:', err);
      showError('เกิดข้อผิดพลาด', err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleSubmit = async (data: UpdateUserInput) => {
    try {
      setSaving(true);
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล');
      }

      // Success - show notification, refresh user data and hide form
      showSuccess('สำเร็จ', 'อัพเดทข้อมูลผู้ใช้งานเรียบร้อยแล้ว');
      await fetchUser();
      setShowEditForm(false);
    } catch (err) {
      console.error('Error updating user:', err);
      showError('เกิดข้อผิดพลาด', err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
      throw err; // Re-throw to let form handle it
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async (data: ResetPasswordInput) => {
    try {
      setResettingPassword(true);
      
      const response = await fetch(`/api/admin/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
      }

      // Show success notification
      showSuccess('สำเร็จ', 'รีเซ็ตรหัสผ่านเรียบร้อยแล้ว');
    } catch (err) {
      console.error('Error resetting password:', err);
      showError('เกิดข้อผิดพลาด', err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
      throw err; // Re-throw to let form handle it
    } finally {
      setResettingPassword(false);
    }
  };

  const handleCancel = () => {
    setShowEditForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="กำลังโหลดข้อมูล..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-lg mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            ไม่พบข้อมูลผู้ใช้งาน
          </p>
          <Button onClick={() => router.push('/admin/users')}>
            กลับไปหน้ารายการผู้ใช้งาน
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            {showEditForm ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'รายละเอียดผู้ใช้งาน'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {user.firstName} {user.lastName}
          </p>
        </div>
        {!showEditForm && (
          <Button onClick={() => setShowEditForm(true)}>
            แก้ไขข้อมูล
          </Button>
        )}
      </div>

      {/* User Details or Edit Form */}
      {showEditForm ? (
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <UserForm
            mode="edit"
            initialData={user}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={saving}
          />
        </div>
      ) : (
        <UserDetails user={user} />
      )}

      {/* Password Reset Form */}
      <div
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          รีเซ็ตรหัสผ่าน
        </h2>
        <PasswordResetForm
          onSubmit={handlePasswordReset}
          isSubmitting={resettingPassword}
        />
      </div>
    </div>
  );
}

export default function EditUserPage() {
  return (
    <ErrorBoundary>
      <EditUserPageContent />
    </ErrorBoundary>
  );
}
