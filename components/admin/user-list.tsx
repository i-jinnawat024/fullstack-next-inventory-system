'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserResponse } from '@/lib/types/user-management';
import { Button } from '@/components/ui/button';
import { Table, Column } from '@/components/ui/table';
import { formatDate } from '@/lib/utils/format';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface UserListProps {
  users: UserResponse[];
  loading?: boolean;
  onUserDeleted?: () => void;
}

/**
 * UserList Component
 * Displays a table of users with role and status badges, and action buttons
 * Requirements: 1.2, 10.1-10.5
 */
export function UserList({ users, loading = false, onUserDeleted }: UserListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle delete button click
  const handleDeleteClick = (user: UserResponse) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน');
      }

      // Close dialog and refresh list
      setDeleteDialogOpen(false);
      setUserToDelete(null);

      // Call parent callback to refresh the list
      if (onUserDeleted) {
        onUserDeleted();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  // Define table columns with proper formatting and badges
  const columns: Column<UserResponse>[] = [
    {
      key: 'firstName',
      header: 'ชื่อ-นามสกุล',
      render: (user) => (
        <span className="font-medium">
          {user.firstName} {user.lastName}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'อีเมล',
      render: (user) => (
        <span style={{ color: 'var(--color-text-secondary)' }}>
          {user.email}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'แผนก',
    },
    {
      key: 'role',
      header: 'บทบาท',
      render: (user) => (
        <span
          className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-md border"
          style={{
            backgroundColor: user.role === 'admin'
              ? 'var(--color-primary)' + '15'
              : 'var(--color-text-secondary)' + '15',
            borderColor: user.role === 'admin'
              ? 'var(--color-primary)' + '40'
              : 'var(--color-text-secondary)' + '40',
            color: user.role === 'admin'
              ? 'var(--color-primary)'
              : 'var(--color-text-secondary)',
          }}
        >
          {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'สถานะ',
      render: (user) => (
        <span
          className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-md border"
          style={{
            backgroundColor: user.isActive
              ? '#10b98120'
              : '#ef444420',
            borderColor: user.isActive
              ? '#10b98140'
              : '#ef444440',
            color: user.isActive
              ? '#059669'
              : '#dc2626',
          }}
        >
          {user.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'วันที่สร้าง',
      render: (user) => (
        <span style={{ color: 'var(--color-text-secondary)' }}>
          {formatDate(user.createdAt)}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'การจัดการ',
      align: 'center',
      render: (user) => (
        <div className="flex items-center justify-center gap-2">
          <Link href={`/admin/users/${user.id}`}>
            <Button
              variant="tertiary"
              size="sm"
              aria-label={`ดูรายละเอียดของ ${user.firstName} ${user.lastName}`}
            >
              ดูรายละเอียด
            </Button>
          </Link>
          <Link href={`/admin/users/${user.id}`}>
            <Button
              variant="secondary"
              size="sm"
              aria-label={`แก้ไขข้อมูลของ ${user.firstName} ${user.lastName}`}
            >
              แก้ไข
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteClick(user)}
            aria-label={`ลบ ${user.firstName} ${user.lastName}`}
          >
            ลบ
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div
        className="rounded-lg border"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <Table
          data={users}
          columns={columns}
          loading={loading}
          emptyMessage="ไม่มีผู้ใช้งานในระบบ"
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        title="ยืนยันการลบผู้ใช้งาน"
        message={`คุณต้องการลบผู้ใช้งาน "${userToDelete?.firstName} ${userToDelete?.lastName}" ใช่หรือไม่? การดำเนินการนี้จะทำให้ผู้ใช้งานถูกปิดการใช้งาน`}
        confirmText="ลบ"
        cancelText="ยกเลิก"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isDeleting}
        variant="danger"
      />
    </>
  );
}
