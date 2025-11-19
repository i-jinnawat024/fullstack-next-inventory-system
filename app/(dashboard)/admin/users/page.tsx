'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserResponse } from '@/lib/types/user-management';
import { Button } from '@/components/ui/button';
import { UserList } from '@/components/admin';
import { useNotification } from '@/lib/contexts/notification-context';
import { ErrorBoundary } from '@/components/ui/error-boundary';

function UsersPageContent() {
  const router = useRouter();
  const { showError } = useNotification();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');

      if (response.status === 401 || response.status === 403) {
        // Unauthorized - redirect to home
        showError('ไม่มีสิทธิ์เข้าถึง', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        router.push('/');
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }

      setUsers(result.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      showError('เกิดข้อผิดพลาด', err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            จัดการผู้ใช้งาน
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            จัดการข้อมูลผู้ใช้งานในระบบ
          </p>
        </div>
        <Link href="/admin/users/new">
          <Button
            variant="primary"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            เพิ่มผู้ใช้งานใหม่
          </Button>
        </Link>
      </div>

      {/* Users Table */}
      <UserList
        users={users}
        loading={loading}
        onUserDeleted={fetchUsers}
      />
    </div>
  );
}

export default function UsersPage() {
  return (
    <ErrorBoundary>
      <UsersPageContent />
    </ErrorBoundary>
  );
}
