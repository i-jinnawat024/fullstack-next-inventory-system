import { z } from 'zod';

// Base validation rules
const emailValidation = z
  .string()
  .min(1, 'กรุณากรอกอีเมล')
  .email('รูปแบบอีเมลไม่ถูกต้อง')
  .toLowerCase()
  .trim();

const passwordValidation = z
  .string()
  .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');

const firstNameValidation = z
  .string()
  .min(1, 'กรุณากรอกชื่อ')
  .trim();

const lastNameValidation = z
  .string()
  .min(1, 'กรุณากรอกนามสกุล')
  .trim();

const departmentValidation = z
  .string()
  .min(1, 'กรุณาเลือกแผนก');

const roleValidation = z.enum(['admin', 'user'], {
  message: 'กรุณาเลือกบทบาท',
});

// Create user schema (for admin)
export const createUserSchema = z.object({
  firstName: firstNameValidation,
  lastName: lastNameValidation,
  email: emailValidation,
  password: passwordValidation,
  department: departmentValidation,
  role: roleValidation,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// Update user schema (for admin)
export const updateUserSchema = z.object({
  firstName: firstNameValidation.optional(),
  lastName: lastNameValidation.optional(),
  email: emailValidation.optional(),
  department: departmentValidation.optional(),
  role: roleValidation.optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// Update profile schema (for regular users)
export const updateProfileSchema = z.object({
  firstName: firstNameValidation.optional(),
  lastName: lastNameValidation.optional(),
  email: emailValidation.optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Change password schema (for regular users)
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'กรุณากรอกรหัสผ่านปัจจุบัน'),
    newPassword: passwordValidation,
    confirmPassword: z.string().min(1, 'กรุณายืนยันรหัสผ่านใหม่'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน',
    path: ['confirmPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Reset password schema (for admin)
export const resetPasswordSchema = z.object({
  newPassword: passwordValidation,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// User ID parameter validation
export const userIdParamSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;
