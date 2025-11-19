import { IUser, CreateUserDTO, UpdateUserDTO } from '@/lib/types/user-management';
import { hashPassword } from '@/lib/auth/jwt';

/**
 * User Database Service
 * 
 * This service handles all user-related database operations.
 * Currently uses in-memory storage for development.
 * In production, this would interact with MongoDB/Mongoose.
 */

class UserDatabase {
  private static instance: UserDatabase;
  private users: IUser[] = [];

  private constructor() {
    this.seedInitialUsers();
  }

  public static getInstance(): UserDatabase {
    if (!UserDatabase.instance) {
      UserDatabase.instance = new UserDatabase();
    }
    return UserDatabase.instance;
  }

  /**
   * Reset database to initial state (for testing)
   */
  public reset(): void {
    this.users = [];
    this.seedInitialUsers();
  }

  /**
   * Seed initial users
   */
  private seedInitialUsers(): void {
    this.users = [
      {
        id: '1',
        firstName: 'ผู้ดูแล',
        lastName: 'ระบบ',
        email: 'admin@company.com',
        password: hashPassword('password'),
        role: 'admin',
        department: 'IT',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        firstName: 'พนักงาน',
        lastName: 'ทั่วไป',
        email: 'user@company.com',
        password: hashPassword('password'),
        role: 'user',
        department: 'การผลิต',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '3',
        firstName: 'หัวหน้า',
        lastName: 'แผนก',
        email: 'manager@company.com',
        password: hashPassword('password'),
        role: 'user',
        department: 'จัดซื้อ',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];
  }

  /**
   * Simulate database delay
   */
  private async simulateDelay(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Find all active users
   */
  async findAllUsers(filter?: { isActive?: boolean }): Promise<IUser[]> {
    await this.simulateDelay();
    
    let users = [...this.users];
    
    if (filter?.isActive !== undefined) {
      users = users.filter(user => user.isActive === filter.isActive);
    }
    
    // Sort by createdAt descending (newest first)
    return users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Find user by ID
   */
  async findUserById(id: string): Promise<IUser | null> {
    await this.simulateDelay();
    return this.users.find(user => user.id === id) || null;
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<IUser | null> {
    await this.simulateDelay();
    const normalizedEmail = email.toLowerCase().trim();
    return this.users.find(user => user.email.toLowerCase() === normalizedEmail) || null;
  }

  /**
   * Check if email exists (excluding a specific user ID)
   */
  async emailExists(email: string, excludeUserId?: string): Promise<boolean> {
    await this.simulateDelay();
    const normalizedEmail = email.toLowerCase().trim();
    return this.users.some(
      user => user.email.toLowerCase() === normalizedEmail && user.id !== excludeUserId
    );
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserDTO): Promise<IUser> {
    await this.simulateDelay();
    
    const newUser: IUser = {
      id: (this.users.length + 1).toString(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email.toLowerCase().trim(),
      password: userData.password, // Should already be hashed
      department: userData.department,
      role: userData.role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.users.push(newUser);
    return newUser;
  }

  /**
   * Update user
   */
  async updateUser(id: string, updates: UpdateUserDTO): Promise<IUser | null> {
    await this.simulateDelay();
    
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    const updatedUser: IUser = {
      ...this.users[userIndex],
      ...updates,
      email: updates.email ? updates.email.toLowerCase().trim() : this.users[userIndex].email,
      updatedAt: new Date(),
    };
    
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  /**
   * Update user password
   */
  async updateUserPassword(id: string, hashedPassword: string): Promise<IUser | null> {
    await this.simulateDelay();
    
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    this.users[userIndex] = {
      ...this.users[userIndex],
      password: hashedPassword,
      updatedAt: new Date(),
    };
    
    return this.users[userIndex];
  }

  /**
   * Soft delete user (set isActive to false)
   */
  async deleteUser(id: string): Promise<boolean> {
    await this.simulateDelay();
    
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;
    
    this.users[userIndex] = {
      ...this.users[userIndex],
      isActive: false,
      updatedAt: new Date(),
    };
    
    return true;
  }

  /**
   * Get all users (for testing purposes)
   */
  getAllUsersForTesting(): IUser[] {
    return [...this.users];
  }
}

// Export singleton instance
export const userDb = UserDatabase.getInstance();
