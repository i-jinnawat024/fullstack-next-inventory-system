'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, UpdateProfileInput } from '@/lib/validations/user-schemas';
import { FormField } from '@/components/forms/form-field';
import { TextInput } from '@/components/forms/text-input';
import { Button } from '@/components/ui/button';
import { UserResponse } from '@/lib/types/user-management';

interface ProfileEditFormProps {
  user: UserResponse;
  onSubmit: (data: UpdateProfileInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * ProfileEditForm Component
 * Form for editing user profile with validation
 * Requirements: 7.1-7.5, 10.1-10.5
 */
export function ProfileEditForm({ 
  user, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}: ProfileEditFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
  });

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
        แก้ไขข้อมูลส่วนตัว
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name fields - 2 columns on tablet and desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <FormField
            label="ชื่อ"
            required
            error={errors.firstName?.message}
            htmlFor="firstName"
          >
            <TextInput
              id="firstName"
              placeholder="กรอกชื่อ"
              {...register('firstName')}
              error={!!errors.firstName}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField
            label="นามสกุล"
            required
            error={errors.lastName?.message}
            htmlFor="lastName"
          >
            <TextInput
              id="lastName"
              placeholder="กรอกนามสกุล"
              {...register('lastName')}
              error={!!errors.lastName}
              disabled={isSubmitting}
            />
          </FormField>
        </div>

        {/* Email field - full width */}
        <FormField
          label="อีเมล"
          required
          error={errors.email?.message}
          htmlFor="email"
          helpText="ใช้สำหรับเข้าสู่ระบบ"
        >
          <TextInput
            id="email"
            type="email"
            placeholder="example@company.com"
            {...register('email')}
            error={!!errors.email}
            disabled={isSubmitting}
          />
        </FormField>

        {/* Read-only fields */}
        <div className="space-y-4 pt-2">
          <div 
            className="rounded-md p-4 border"
            style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)',
            }}
          >
            <p 
              className="text-sm font-medium mb-3"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              ข้อมูลที่ไม่สามารถแก้ไขได้
            </p>
            
            <div className="space-y-3">
              <div>
                <label 
                  className="block text-xs font-medium mb-1"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  แผนก
                </label>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--color-text)' }}
                >
                  {user.department}
                </p>
              </div>

              <div>
                <label 
                  className="block text-xs font-medium mb-1"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  บทบาท
                </label>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--color-text)' }}
                >
                  {getRoleLabel(user.role)}
                </p>
              </div>
            </div>
          </div>

          <p 
            className="text-xs"
            style={{ color: 'var(--color-text-muted)' }}
          >
            หากต้องการเปลี่ยนแปลงแผนกหรือบทบาท กรุณาติดต่อผู้ดูแลระบบ
          </p>
        </div>

        {/* Form Actions - Stack vertically on mobile, horizontal on tablet+ */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting || !isDirty}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            ยกเลิก
          </Button>
        </div>
      </form>
    </div>
  );
}
