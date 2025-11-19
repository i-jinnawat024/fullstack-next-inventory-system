'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordInput } from '@/lib/validations/user-schemas';
import { FormField } from '@/components/forms/form-field';
import { TextInput } from '@/components/forms/text-input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface PasswordResetFormProps {
  onSubmit: (data: ResetPasswordInput) => Promise<void>;
  isSubmitting?: boolean;
}

/**
 * PasswordResetForm Component
 * Form for admin to reset user password
 * Requirements: 5.1-5.3, 10.1-10.4
 */
export function PasswordResetForm({ onSubmit, isSubmitting = false }: PasswordResetFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
    },
  });

  const handleFormSubmit = async (data: ResetPasswordInput) => {
    await onSubmit(data);
    reset(); // Clear form after successful submission
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <FormField
        label="รหัสผ่านใหม่"
        required
        error={errors.newPassword?.message}
        htmlFor="newPassword"
        helpText="รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
      >
        <div className="relative">
          <TextInput
            id="newPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="กรอกรหัสผ่านใหม่"
            {...register('newPassword')}
            error={!!errors.newPassword}
            disabled={isSubmitting}
            autoComplete="new-password"
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

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? 'กำลังรีเซ็ตรหัสผ่าน...' : 'รีเซ็ตรหัสผ่าน'}
        </Button>
      </div>
    </form>
  );
}
