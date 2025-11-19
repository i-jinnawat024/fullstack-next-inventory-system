'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, ChangePasswordInput } from '@/lib/validations/user-schemas';
import { FormField } from '@/components/forms/form-field';
import { TextInput } from '@/components/forms/text-input';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';

interface ChangePasswordFormProps {
  onSubmit: (data: ChangePasswordInput) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

/**
 * ChangePasswordForm Component
 * Form for changing user password with validation and strength indicator
 * Requirements: 8.1-8.7, 10.1-10.4
 */
export function ChangePasswordForm({ 
  onSubmit, 
  onCancel,
  isSubmitting = false 
}: ChangePasswordFormProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: '', color: '' };

    let score = 0;
    
    // Length check
    if (newPassword.length >= 8) score++;
    if (newPassword.length >= 12) score++;
    
    // Character variety checks
    if (/[a-z]/.test(newPassword)) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^a-zA-Z0-9]/.test(newPassword)) score++;

    // Determine strength level
    if (score <= 2) {
      return { 
        score, 
        label: 'อ่อนแอ', 
        color: 'var(--color-error)',
        percentage: 33
      };
    } else if (score <= 4) {
      return { 
        score, 
        label: 'ปานกลาง', 
        color: '#f59e0b',
        percentage: 66
      };
    } else {
      return { 
        score, 
        label: 'แข็งแรง', 
        color: '#10b981',
        percentage: 100
      };
    }
  }, [newPassword]);

  const PasswordToggleButton = ({ 
    show, 
    onClick, 
    disabled 
  }: { 
    show: boolean; 
    onClick: () => void; 
    disabled: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
      style={{ color: 'var(--color-text-secondary)' }}
      disabled={disabled}
      aria-label={show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
    >
      {show ? (
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
  );

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
        เปลี่ยนรหัสผ่าน
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Current Password */}
        <FormField
          label="รหัสผ่านปัจจุบัน"
          required
          error={errors.currentPassword?.message}
          htmlFor="currentPassword"
        >
          <div className="relative">
            <TextInput
              id="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder="กรอกรหัสผ่านปัจจุบัน"
              {...register('currentPassword')}
              error={!!errors.currentPassword}
              disabled={isSubmitting}
            />
            <PasswordToggleButton
              show={showCurrentPassword}
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              disabled={isSubmitting}
            />
          </div>
        </FormField>

        {/* New Password */}
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
              type={showNewPassword ? 'text' : 'password'}
              placeholder="กรอกรหัสผ่านใหม่"
              {...register('newPassword')}
              error={!!errors.newPassword}
              disabled={isSubmitting}
            />
            <PasswordToggleButton
              show={showNewPassword}
              onClick={() => setShowNewPassword(!showNewPassword)}
              disabled={isSubmitting}
            />
          </div>

          {/* Password Strength Indicator */}
          {newPassword && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span 
                  className="text-xs font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  ความแข็งแรงของรหัสผ่าน:
                </span>
                <span 
                  className="text-xs font-semibold"
                  style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.label}
                </span>
              </div>
              
              {/* Progress bar */}
              <div 
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--color-border)' }}
              >
                <div
                  className="h-full transition-all duration-300 ease-out"
                  style={{
                    width: `${passwordStrength.percentage}%`,
                    backgroundColor: passwordStrength.color,
                  }}
                />
              </div>

              {/* Password requirements */}
              <div className="pt-2 space-y-1">
                <p 
                  className="text-xs font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  รหัสผ่านควรมี:
                </p>
                <ul className="space-y-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <li className="flex items-center gap-1.5">
                    <span className={newPassword.length >= 8 ? 'text-green-500' : ''}>
                      {newPassword.length >= 8 ? '✓' : '○'}
                    </span>
                    อย่างน้อย 8 ตัวอักษร
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className={/[A-Z]/.test(newPassword) ? 'text-green-500' : ''}>
                      {/[A-Z]/.test(newPassword) ? '✓' : '○'}
                    </span>
                    ตัวอักษรพิมพ์ใหญ่
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className={/[a-z]/.test(newPassword) ? 'text-green-500' : ''}>
                      {/[a-z]/.test(newPassword) ? '✓' : '○'}
                    </span>
                    ตัวอักษรพิมพ์เล็ก
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className={/[0-9]/.test(newPassword) ? 'text-green-500' : ''}>
                      {/[0-9]/.test(newPassword) ? '✓' : '○'}
                    </span>
                    ตัวเลข
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className={/[^a-zA-Z0-9]/.test(newPassword) ? 'text-green-500' : ''}>
                      {/[^a-zA-Z0-9]/.test(newPassword) ? '✓' : '○'}
                    </span>
                    อักขระพิเศษ (!@#$%^&*)
                  </li>
                </ul>
              </div>
            </div>
          )}
        </FormField>

        {/* Confirm Password */}
        <FormField
          label="ยืนยันรหัสผ่านใหม่"
          required
          error={errors.confirmPassword?.message}
          htmlFor="confirmPassword"
        >
          <div className="relative">
            <TextInput
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              {...register('confirmPassword')}
              error={!!errors.confirmPassword}
              disabled={isSubmitting}
            />
            <PasswordToggleButton
              show={showConfirmPassword}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isSubmitting}
            />
          </div>
        </FormField>

        {/* Form Actions - Stack vertically on mobile, horizontal on tablet+ */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'กำลังเปลี่ยนรหัสผ่าน...' : 'เปลี่ยนรหัสผ่าน'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              ยกเลิก
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
