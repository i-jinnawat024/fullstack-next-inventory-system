'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserResponse } from '@/lib/types/user-management';
import { Button } from '@/components/ui/button';
import { ProfileView, ProfileEditForm } from '@/components/profile';
import { UpdateProfileInput } from '@/lib/validations/user-schemas';
import { useNotification } from '@/lib/contexts/notification-context';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

/**
 * Profile Page
 * Display and edit user profile
 * Requirements: 6.1-6.3, 7.1-7.5, 9.2, 10.1-10.5
 */
function ProfilePageContent() {
  const router = useRouter();
  const { showSuccess, showError } = useNotification();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile');

      if (response.status === 401) {
        // Unauthorized - redirect to login
        showError('ไม่ได้รับอนุญาต', 'กรุณาเข้าสู่ระบบอีกครั้ง');
        router.push('/login');
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }

      setUser(result.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      showError('เกิดข้อผิดพลาด', err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle profile update
  const handleUpdateProfile = async (data: UpdateProfileInput) => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล');
      }

      // Update local state with new data
      setUser(result.data);
      setIsEditing(false);
      showSuccess('สำเร็จ', 'อัพเดทข้อมูลโปรไฟล์เรียบร้อยแล้ว');
    } catch (err) {
      console.error('Error updating profile:', err);
      showError('เกิดข้อผิดพลาด', err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Handle navigate to change password page
  const handleChangePassword = () => {
    router.push('/profile/password');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            โปรไฟล์ของฉัน
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            จัดการข้อมูลส่วนตัวของคุณ
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" text="กำลังโหลดข้อมูล..." />
        </div>
      )}

      {/* Profile Content */}
      {!loading && user && (
        <>
          {/* Action Buttons - Only show in view mode */}
          {!isEditing && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                onClick={() => setIsEditing(true)}
              >
                แก้ไขข้อมูล
              </Button>
              <Button
                variant="secondary"
                onClick={handleChangePassword}
              >
                เปลี่ยนรหัสผ่าน
              </Button>
            </div>
          )}

          {/* View or Edit Mode */}
          {isEditing ? (
            <ProfileEditForm
              user={user}
              onSubmit={handleUpdateProfile}
              onCancel={handleCancelEdit}
              isSubmitting={isSubmitting}
            />
          ) : (
            <ProfileView user={user} />
          )}
        </>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ErrorBoundary>
      <ProfilePageContent />
    </ErrorBoundary>
  );
}
