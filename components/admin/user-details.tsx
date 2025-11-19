'use client';

import { UserResponse } from '@/lib/types/user-management';
import { formatDate } from '@/lib/utils/format';

interface UserDetailsProps {
  user: UserResponse;
}

export function UserDetails({ user }: UserDetailsProps) {
  return (
    <div
      className="rounded-lg border p-6"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <h2
        className="text-lg font-semibold mb-6"
        style={{ color: 'var(--color-text)' }}
      >
        รายละเอียดผู้ใช้งาน
      </h2>

      <div className="space-y-4">
        {/* ID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <dt
            className="text-sm font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            ID:
          </dt>
          <dd
            className="md:col-span-2 text-sm"
            style={{ color: 'var(--color-text)' }}
          >
            {user.id}
          </dd>
        </div>

        {/* Name */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <dt
            className="text-sm font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            ชื่อ-นามสกุล:
          </dt>
          <dd
            className="md:col-span-2 text-sm"
            style={{ color: 'var(--color-text)' }}
          >
            {user.firstName} {user.lastName}
          </dd>
        </div>

        {/* Email */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <dt
            className="text-sm font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            อีเมล:
          </dt>
          <dd
            className="md:col-span-2 text-sm"
            style={{ color: 'var(--color-text)' }}
          >
            {user.email}
          </dd>
        </div>

        {/* Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <dt
            className="text-sm font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            สถานะ:
          </dt>
          <dd className="md:col-span-2">
            <span
              className="inline-flex items-center px-2.5 py-1 text-sm font-medium rounded-md border"
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
              {user.isActive ? 'เปิดใช้' : 'ปิดใช้'}
            </span>
          </dd>
        </div>

        {/* Created At */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <dt
            className="text-sm font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            วันที่สร้าง:
          </dt>
          <dd
            className="md:col-span-2 text-sm"
            style={{ color: 'var(--color-text)' }}
          >
            {formatDate(user.createdAt)}
          </dd>
        </div>

        {/* Updated At */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <dt
            className="text-sm font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            วันที่แก้ไขล่าสุด:
          </dt>
          <dd
            className="md:col-span-2 text-sm"
            style={{ color: 'var(--color-text)' }}
          >
            {formatDate(user.updatedAt)}
          </dd>
        </div>
      </div>
    </div>
  );
}
