import { User, InventoryItem, Requisition, StockAdjustment, Notice } from '@/lib/types';

// Mock database class for development
export class MockDatabase {
  private static instance: MockDatabase;
  private users: User[] = [];
  private inventory: InventoryItem[] = [];
  private requisitions: Requisition[] = [];
  private stockAdjustments: StockAdjustment[] = [];
  private notices: Notice[] = [];

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  // Simulate API delay
  private async simulateDelay(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Seed initial data
  private seedInitialData(): void {
    // Sample users
    this.users = [
      {
        id: '1',
        email: 'admin@company.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        name: 'ผู้ดูแลระบบ',
        role: 'admin',
        department: 'IT',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isActive: true,
      },
      {
        id: '2',
        email: 'user@company.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        name: 'พนักงานทั่วไป',
        role: 'user',
        department: 'การผลิต',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isActive: true,
      },
      {
        id: '3',
        email: 'manager@company.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        name: 'หัวหน้าแผนก',
        role: 'user',
        department: 'จัดซื้อ',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isActive: true,
      },
    ];
  }

  // User operations
  async findUserByEmail(email: string): Promise<User | null> {
    await this.simulateDelay();
    return this.users.find(user => user.email === email && user.isActive) || null;
  }

  async findUserById(id: string): Promise<User | null> {
    await this.simulateDelay();
    return this.users.find(user => user.id === id && user.isActive) || null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    await this.simulateDelay();
    const newUser: User = {
      ...userData,
      id: (this.users.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    await this.simulateDelay();
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date(),
    };
    return this.users[userIndex];
  }

  // Generic CRUD operations for future use
  async findMany<T>(collection: keyof MockDatabase, filter?: any): Promise<T[]> {
    await this.simulateDelay();
    const data = this[collection] as T[];
    return data || [];
  }

  async findById<T>(collection: keyof MockDatabase, id: string): Promise<T | null> {
    await this.simulateDelay();
    const data = this[collection] as any[];
    return data.find(item => item.id === id) || null;
  }

  async create<T>(collection: keyof MockDatabase, item: T): Promise<T> {
    await this.simulateDelay();
    const data = this[collection] as any[];
    data.push(item);
    return item;
  }

  async update<T>(collection: keyof MockDatabase, id: string, updates: Partial<T>): Promise<T | null> {
    await this.simulateDelay();
    const data = this[collection] as any[];
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return null;

    data[index] = { ...data[index], ...updates, updatedAt: new Date() };
    return data[index];
  }

  async delete(collection: keyof MockDatabase, id: string): Promise<boolean> {
    await this.simulateDelay();
    const data = this[collection] as any[];
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return false;

    data.splice(index, 1);
    return true;
  }
}

// Export singleton instance
export const mockDb = MockDatabase.getInstance();