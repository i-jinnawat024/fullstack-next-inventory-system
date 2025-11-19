'use client';

import { UserResponse } from '@/lib/types/user-management';
import { formatDate } from '@/lib/utils/format';

interface ProfileViewProps {
  user: UserResponse;
}

/**
 * ProfileView Component
 * Displays user profile information in card format
 * Requirements: 6.2, 7.3, 10.5
 */
export function ProfileView({ user }: ProfileViewProps) {
  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' 
      ? 'var(--color-primary)' 
      : 'var(--color-text-secondary)';
  };

  const getRoleLabel = (role: string) => {
    return role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน';
  };

  return (
    <div 
      className="rounded-lg p-6 shadow-sm border"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <h2 
        className="text-lg font-semibold mb-6"
        style={{ color: 'var(--color-text)' }}
      >
        ข้อมูลส่วนตัว
      </h2>

      <div className="space-y-4">
        {/* Name fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              ชื่อ
            </label>
            <p 
              className="text-base"
              style={{ color: 'var(--color-text)' }}
            >
              {user.firstName}
            </p>
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              นามสกุล
            </label>
            <p 
              className="text-base"
              style={{ color: 'var(--color-text)' }}
            >
              {user.lastName}
            </p>
          </div>
        </div>

        {/* Email */}
        <div>
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            อีเมล
          </label>
          <p 
            className="text-base"
            style={{ color: 'var(--color-text)' }}
          >
            {user.email}
          </p>
        </div>

        {/* Department - Read-only field */}
        <div>
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            แผนก
            <span 
              className="ml-2 text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              (ไม่สามารถแก้ไขได้)
            </span>
          </label>
          <p 
            className="text-base"
            style={{ color: 'var(--color-text)' }}
          >
            {user.department}
          </p>
        </div>

        {/* Role - Read-only field */}
        <div>
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            บทบาท
            <span 
              className="ml-2 text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              (ไม่สามารถแก้ไขได้)
            </span>
          </label>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${getRoleBadgeColor(user.role)}20`,
                color: getRoleBadgeColor(user.role),
              }}
            >
              {getRoleLabel(user.role)}
            </span>
          </div>
        </div>

        {/* Created date */}
        <div>
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            วันที่สร้างบัญชี
          </label>
          <p 
            className="text-base"
            style={{ color: 'var(--color-text)' }}
          >
            {formatDate(user.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
