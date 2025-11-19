import { 
  IUser, 
  CreateUserDTO, 
  UpdateUserDTO, 
  UpdateProfileDTO,
  ChangePasswordDTO,
  UserError,
  UserErrorCodes,
  UserResponse
} from '@/lib/types/user-management';
import { userDb } from '@/lib/database/user-database';
import { hashPassword, comparePassword } from '@/lib/auth/jwt';
import { formatUserResponse, formatUsersResponse } from '@/lib/database/models/user.model';

/**
 * UserService - Business logic layer for user management
 * 
 * This service handles all user-related business logic including:
 * - Admin operations (CRUD for all users)
 * - User profile operations (self-management)
 * - Validation
 * - Password management
 * - Error handling
 */
class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // ==================== Admin Operations ====================

  /**
   * Get all users (admin only)
   * @param filters - Optional filters (e.g., isActive)
   * @returns Array of users without password field
   */
  async getAllUsers(filters?: { isActive?: boolean }): Promise<UserResponse[]> {
    try {
      const users = await userDb.findAllUsers(filters);
      return formatUsersResponse(users);
    } catch (error) {
      throw new UserError(
        'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน',
        500,
        UserErrorCodes.VALIDATION_ERROR
      );
    }
  }

  /**
   * Get user by ID (admin only)
   * @param userId - User ID
   * @returns User without password field
   * @throws UserError if user not found
   */
  async getUserById(userId: string): Promise<UserResponse> {
    const user = await userDb.findUserById(userId);
    
    if (!user) {
      throw new UserError(
        'ไม่พบข้อมูลผู้ใช้งาน',
        404,
        UserErrorCodes.USER_NOT_FOUND
      );
    }

    return formatUserResponse(user);
  }

  /**
   * Create a new user (admin only)
   * @param userData - User data
   * @returns Created user without password field
   * @throws UserError if email already exists
   */
  async createUser(userData: CreateUserDTO): Promise<UserResponse> {
    // Validate email uniqueness
    const emailExists = await this.validateEmail(userData.email);
    if (!emailExists) {
      throw new UserError(
        'อีเมลนี้ถูกใช้งานแล้ว',
        400,
        UserErrorCodes.EMAIL_ALREADY_EXISTS
      );
    }

    // Hash password before storing
    const hashedPassword = hashPassword(userData.password);

    // Create user with hashed password
    const userToCreate: CreateUserDTO = {
      ...userData,
      password: hashedPassword,
    };

    const newUser = await userDb.createUser(userToCreate);
    return formatUserResponse(newUser);
  }

  /**
   * Update user (admin only)
   * @param userId - User ID
   * @param userData - Updated user data
   * @returns Updated user without password field
   * @throws UserError if user not found or email already exists
   */
  async updateUser(userId: string, userData: UpdateUserDTO): Promise<UserResponse> {
    // Check if user exists
    const existingUser = await userDb.findUserById(userId);
    if (!existingUser) {
      throw new UserError(
        'ไม่พบข้อมูลผู้ใช้งาน',
        404,
        UserErrorCodes.USER_NOT_FOUND
      );
    }

    // If email is being updated, check uniqueness
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await this.validateEmail(userData.email, userId);
      if (!emailExists) {
        throw new UserError(
          'อีเมลนี้ถูกใช้งานแล้ว',
          400,
          UserErrorCodes.EMAIL_ALREADY_EXISTS
        );
      }
    }

    const updatedUser = await userDb.updateUser(userId, userData);
    
    if (!updatedUser) {
      throw new UserError(
        'เกิดข้อผิดพลาดในการอัพเดทข้อมูล',
        500,
        UserErrorCodes.VALIDATION_ERROR
      );
    }

    return formatUserResponse(updatedUser);
  }

  /**
   * Update user password (admin only - password reset)
   * @param userId - User ID
   * @param newPassword - New password (plain text)
   * @throws UserError if user not found
   */
  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    // Check if user exists
    const existingUser = await userDb.findUserById(userId);
    if (!existingUser) {
      throw new UserError(
        'ไม่พบข้อมูลผู้ใช้งาน',
        404,
        UserErrorCodes.USER_NOT_FOUND
      );
    }

    // Hash new password
    const hashedPassword = hashPassword(newPassword);

    // Update password
    const updatedUser = await userDb.updateUserPassword(userId, hashedPassword);
    
    if (!updatedUser) {
      throw new UserError(
        'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน',
        500,
        UserErrorCodes.VALIDATION_ERROR
      );
    }
  }

  // ==================== User Profile Operations ====================

  /**
   * Get user profile (for authenticated user)
   * @param userId - User ID from session
   * @returns User profile without password field
   * @throws UserError if user not found
   */
  async getUserProfile(userId: string): Promise<UserResponse> {
    const user = await userDb.findUserById(userId);
    
    if (!user) {
      throw new UserError(
        'ไม่พบข้อมูลผู้ใช้งาน',
        404,
        UserErrorCodes.USER_NOT_FOUND
      );
    }

    return formatUserResponse(user);
  }

  /**
   * Update user profile (for authenticated user)
   * @param userId - User ID from session
   * @param profileData - Profile data to update (firstName, lastName, email only)
   * @returns Updated user profile without password field
   * @throws UserError if user not found or email already exists
   */
  async updateProfile(userId: string, profileData: UpdateProfileDTO): Promise<UserResponse> {
    // Check if user exists
    const existingUser = await userDb.findUserById(userId);
    if (!existingUser) {
      throw new UserError(
        'ไม่พบข้อมูลผู้ใช้งาน',
        404,
        UserErrorCodes.USER_NOT_FOUND
      );
    }

    // If email is being updated, check uniqueness
    if (profileData.email && profileData.email !== existingUser.email) {
      const emailExists = await this.validateEmail(profileData.email, userId);
      if (!emailExists) {
        throw new UserError(
          'อีเมลนี้ถูกใช้งานแล้ว',
          400,
          UserErrorCodes.EMAIL_ALREADY_EXISTS
        );
      }
    }

    // Update only allowed fields (firstName, lastName, email)
    const updateData: UpdateUserDTO = {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
    };

    const updatedUser = await userDb.updateUser(userId, updateData);
    
    if (!updatedUser) {
      throw new UserError(
        'เกิดข้อผิดพลาดในการอัพเดทข้อมูล',
        500,
        UserErrorCodes.VALIDATION_ERROR
      );
    }

    return formatUserResponse(updatedUser);
  }

  /**
   * Change user password (for authenticated user)
   * @param userId - User ID from session
   * @param currentPassword - Current password (plain text)
   * @param newPassword - New password (plain text)
   * @throws UserError if user not found, current password is incorrect, or passwords match
   */
  async changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<void> {
    // Get user with password
    const user = await userDb.findUserById(userId);
    
    if (!user) {
      throw new UserError(
        'ไม่พบข้อมูลผู้ใช้งาน',
        404,
        UserErrorCodes.USER_NOT_FOUND
      );
    }

    // Verify current password
    const isPasswordValid = await this.validatePassword(userId, currentPassword);
    if (!isPasswordValid) {
      throw new UserError(
        'รหัสผ่านปัจจุบันไม่ถูกต้อง',
        400,
        UserErrorCodes.INVALID_PASSWORD
      );
    }

    // Hash new password
    const hashedPassword = hashPassword(newPassword);

    // Update password
    const updatedUser = await userDb.updateUserPassword(userId, hashedPassword);
    
    if (!updatedUser) {
      throw new UserError(
        'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน',
        500,
        UserErrorCodes.VALIDATION_ERROR
      );
    }
  }

  // ==================== Validation Helper Methods ====================

  /**
   * Validate email uniqueness
   * @param email - Email to validate
   * @param excludeUserId - Optional user ID to exclude from check (for updates)
   * @returns true if email is available, false if already exists
   */
  async validateEmail(email: string, excludeUserId?: string): Promise<boolean> {
    const emailExists = await userDb.emailExists(email, excludeUserId);
    return !emailExists; // Return true if email is available (doesn't exist)
  }

  /**
   * Validate password for a user
   * @param userId - User ID
   * @param password - Password to validate (plain text)
   * @returns true if password is correct, false otherwise
   */
  async validatePassword(userId: string, password: string): Promise<boolean> {
    const user = await userDb.findUserById(userId);
    
    if (!user) {
      return false;
    }

    return comparePassword(password, user.password);
  }
}

// Export singleton instance
export const userService = UserService.getInstance();
