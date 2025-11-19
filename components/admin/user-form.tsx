'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, updateUserSchema, CreateUserInput, UpdateUserInput } from '@/lib/validations/user-schemas';
import { FormField } from '@/components/forms/form-field';
import { TextInput } from '@/components/forms/text-input';
import { Select } from '@/components/forms/select';
import { Button } from '@/components/ui/button';
import { UserResponse } from '@/lib/types/user-management';
import { useState } from 'react';

interface CreateUserFormProps {
  mode: 'create';
  initialData?: never;
  onSubmit: (data: CreateUserInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface EditUserFormProps {
  mode: 'edit';
  initialData: UserResponse;
  onSubmit: (data: UpdateUserInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

type UserFormProps = CreateUserFormProps | EditUserFormProps;

/**
 * UserForm Component
 * Form for creating and editing users with validation
 * Requirements: 3.1-3.6, 4.1-4.5, 10.1-10.5
 */
export function UserForm(props: UserFormProps) {
  const { mode, onSubmit, onCancel, isSubmitting = false } = props;
  const initialData = mode === 'edit' ? props.initialData : undefined;
  const [showPassword, setShowPassword] = useState(false);

  // Use appropriate schema and form based on mode
  if (mode === 'create') {
    return <CreateUserFormContent onSubmit={onSubmit} onCancel={onCancel} isSubmitting={isSubmitting} showPassword={showPassword} setShowPassword={setShowPassword} />;
  } else {
    return <EditUserFormContent initialData={initialData!} onSubmit={onSubmit} onCancel={onCancel} isSubmitting={isSubmitting} />;
  }
}

function CreateUserFormContent({ 
  onSubmit, 
  onCancel, 
  isSubmitting,
  showPassword,
  setShowPassword 
}: { 
  onSubmit: (data: CreateUserInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      department: '',
      role: 'user' as const,
    },
  });

  const departmentOptions = [
    { value: 'IT', label: 'ไอที' },
    { value: 'HR', label: 'ทรัพยากรบุคคล' },
    { value: 'Finance', label: 'การเงิน' },
    { value: 'Operations', label: 'ปฏิบัติการ' },
    { value: 'Sales', label: 'ฝ่ายขาย' },
    { value: 'Marketing', label: 'การตลาด' },
    { value: 'Warehouse', label: 'คลังสินค้า' },
    { value: 'Procurement', label: 'จัดซื้อ' },
  ];

  const roleOptions = [
    { value: 'user', label: 'ผู้ใช้งาน' },
    { value: 'admin', label: 'ผู้ดูแลระบบ' },
  ];

  return (
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

      {/* Password field - only for create mode */}
      <FormField
        label="รหัสผ่าน"
        required
        error={errors.password?.message}
        htmlFor="password"
        helpText="รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
      >
        <div className="relative">
          <TextInput
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="กรอกรหัสผ่าน"
            {...register('password')}
            error={!!errors.password}
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
            disabled={isSubmitting}
            aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </FormField>

      {/* Form Actions - Stack vertically on mobile, horizontal on tablet+ */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="w-full sm:w-auto cursor-pointer"
          
        >
          {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto cursor-pointer"
        >
          ยกเลิก
        </Button>
      </div>
    </form>
  );
}

function EditUserFormContent({ 
  initialData,
  onSubmit, 
  onCancel, 
  isSubmitting 
}: { 
  initialData: UserResponse;
  onSubmit: (data: UpdateUserInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      email: initialData.email,
      department: initialData.department,
      role: initialData.role,
      isActive: initialData.isActive,
    },
  });

  const departmentOptions = [
    { value: 'IT', label: 'ไอที' },
    { value: 'HR', label: 'ทรัพยากรบุคคล' },
    { value: 'Finance', label: 'การเงิน' },
    { value: 'Operations', label: 'ปฏิบัติการ' },
    { value: 'Sales', label: 'ฝ่ายขาย' },
    { value: 'Marketing', label: 'การตลาด' },
    { value: 'Warehouse', label: 'คลังสินค้า' },
    { value: 'Procurement', label: 'จัดซื้อ' },
  ];

  const roleOptions = [
    { value: 'user', label: 'ผู้ใช้งาน' },
    { value: 'admin', label: 'ผู้ดูแลระบบ' },
  ];

  const statusOptions = [
    { value: 'true', label: 'เปิดใช้งาน' },
    { value: 'false', label: 'ปิดใช้งาน' },
  ];

  const handleFormSubmit = async (data: UpdateUserInput) => {
    // Convert isActive string to boolean if needed
    if ('isActive' in data && typeof data.isActive === 'string') {
      data.isActive = data.isActive === 'true';
    }
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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

      {/* Department and Role - 2 columns on tablet and desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <FormField
          label="แผนก"
          required
          error={errors.department?.message}
          htmlFor="department"
        >
          <Select
            id="department"
            options={departmentOptions}
            {...register('department')}
            error={!!errors.department}
            placeholder="เลือกแผนก"
            disabled={isSubmitting}
          />
        </FormField>

        <FormField
          label="บทบาท"
          required
          error={errors.role?.message}
          htmlFor="role"
        >
          <Select
            id="role"
            options={roleOptions}
            {...register('role')}
            error={!!errors.role}
            placeholder="เลือกบทบาท"
            disabled={isSubmitting}
          />
        </FormField>
      </div>

      {/* Status field - only for edit mode */}
      <FormField
        label="สถานะ"
        required
        error={errors.isActive?.message}
        htmlFor="isActive"
      >
        <Select
          id="isActive"
          options={statusOptions}
          {...register('isActive')}
          error={!!errors.isActive}
          disabled={isSubmitting}
        />
      </FormField>

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
  );
}
