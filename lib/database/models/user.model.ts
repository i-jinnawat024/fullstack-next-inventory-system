import { IUser } from '@/lib/types/user-management';

/**
 * User Model for Mock Database
 * 
 * This model represents the User entity in the mock database.
 * In a production environment with MongoDB, this would be a Mongoose schema.
 */

export interface UserModel extends IUser {
  // Additional model-specific methods can be added here
}

/**
 * Helper function to exclude password from user object
 */
export function excludePassword(user: IUser): Omit<IUser, 'password'> {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Helper function to format user for API response
 */
export function formatUserResponse(user: IUser): Omit<IUser, 'password'> {
  return excludePassword(user);
}

/**
 * Helper function to format multiple users for API response
 */
export function formatUsersResponse(users: IUser[]): Omit<IUser, 'password'>[] {
  return users.map(formatUserResponse);
}

/**
 * Validate user data structure
 */
export function isValidUser(user: any): user is IUser {
  return (
    typeof user === 'object' &&
    user !== null &&
    typeof user.id === 'string' &&
    typeof user.firstName === 'string' &&
    typeof user.lastName === 'string' &&
    typeof user.email === 'string' &&
    typeof user.password === 'string' &&
    typeof user.department === 'string' &&
    (user.role === 'admin' || user.role === 'user') &&
    typeof user.isActive === 'boolean' &&
    user.createdAt instanceof Date &&
    user.updatedAt instanceof Date
  );
}
