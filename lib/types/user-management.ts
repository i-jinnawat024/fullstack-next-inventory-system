// User Management Types and DTOs

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string; // hashed
  department: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs for API requests
export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  department: string;
  role: 'admin' | 'user';
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: string;
  role?: 'admin' | 'user';
  isActive?: boolean;
}

export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordDTO {
  newPassword: string;
}

// Response types (exclude password)
export type UserResponse = Omit<IUser, 'password'>;

// Error codes
export const UserErrorCodes = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PASSWORD_MISMATCH: 'PASSWORD_MISMATCH',
  FORBIDDEN: 'FORBIDDEN',
} as const;

export type UserErrorCode = typeof UserErrorCodes[keyof typeof UserErrorCodes];

// Custom error class
export class UserError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: UserErrorCode
  ) {
    super(message);
    this.name = 'UserError';
  }
}
