import { User, InventoryItem, Requisition, RequisitionItem, StockAdjustment, Notice, AuditTrail } from '@/lib/types';

// Mock database class for development
export class MockDatabase {
  private static instance: MockDatabase;
  private users: User[] = [];
  private inventory: InventoryItem[] = [];
  private requisitions: Requisition[] = [];
  private stockAdjustments: StockAdjustment[] = [];
  private notices: Notice[] = [];
  private auditTrail: AuditTrail[] = [];

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  // Reset database to initial state (for testing)
  public reset(): void {
    this.users = [];
    this.inventory = [];
    this.requisitions = [];
    this.stockAdjustments = [];
    this.notices = [];
    this.auditTrail = [];
    this.seedInitialData();
  }

  // Generic methods for testing
  async findMany(collection: string, filter?: any): Promise<any[]> {
    await this.simulateDelay();
    const data = this.getCollection(collection);
    if (!filter) return data;
    
    return data.filter((item: any) => {
      return Object.keys(filter).every(key => item[key] === filter[key]);
    });
  }

  async findById(collection: string, id: string): Promise<any | null> {
    await this.simulateDelay();
    const data = this.getCollection(collection);
    return data.find((item: any) => item.id === id) || null;
  }

  async create(collection: string, data: any): Promise<any> {
    await this.simulateDelay();
    const collectionData = this.getCollection(collection);
    const newItem = {
      ...data,
      id: `${collection}-${Date.now()}-${Math.random()}`,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    };
    collectionData.push(newItem);
    return newItem;
  }

  async update(collection: string, id: string, updates: any): Promise<any | null> {
    await this.simulateDelay();
    const collectionData = this.getCollection(collection);
    const index = collectionData.findIndex((item: any) => item.id === id);
    if (index === -1) return null;
    
    collectionData[index] = {
      ...collectionData[index],
      ...updates,
      updatedAt: new Date(),
    };
    return collectionData[index];
  }

  private getCollection(name: string): any[] {
    switch (name) {
      case 'users':
        return this.users;
      case 'inventory':
        return this.inventory;
      case 'requisitions':
        return this.requisitions;
      case 'stockAdjustments':
        return this.stockAdjustments;
      case 'notices':
        return this.notices;
      case 'auditTrail':
        return this.auditTrail;
      default:
        throw new Error(`Unknown collection: ${name}`);
    }
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
        password: '$2a$10$cGFzc3dvcmRkZXYtc2VjcmV0LWtleS1jaGFuZ2UtaW4tcHJvZHVjdGlvbg==', // password
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
        password: '$2a$10$cGFzc3dvcmRkZXYtc2VjcmV0LWtleS1jaGFuZ2UtaW4tcHJvZHVjdGlvbg==', // password
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
        password: '$2a$10$cGFzc3dvcmRkZXYtc2VjcmV0LWtleS1jaGFuZ2UtaW4tcHJvZHVjdGlvbg==', // password
        name: 'หัวหน้าแผนก',
        role: 'user',
        department: 'จัดซื้อ',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isActive: true,
      },
    ];

    // Sample inventory items with Thai names
    this.inventory = [
      {
        id: '1',
        code: 'PEN-001',
        name: 'ปากกาลูกลื่น สีน้ำเงิน',
        description: 'ปากกาลูกลื่น หมึกสีน้ำเงิน เขียนลื่น ไม่ซึม',
        category: 'เครื่องเขียน',
        unit: 'ด้าม',
        currentStock: 150,
        minimumStock: 20,
        imageUrl: '/images/pen-blue.jpg',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        code: 'PEN-002',
        name: 'ปากกาลูกลื่น สีดำ',
        description: 'ปากกาลูกลื่น หมึกสีดำ เขียนลื่น ไม่ซึม',
        category: 'เครื่องเขียน',
        unit: 'ด้าม',
        currentStock: 200,
        minimumStock: 20,
        imageUrl: '/images/pen-black.jpg',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '3',
        code: 'PAPER-001',
        name: 'กระดาษ A4 80 แกรม',
        description: 'กระดาษ A4 ขาว 80 แกรม คุณภาพดี สำหรับงานพิมพ์ทั่วไป',
        category: 'กระดาษ',
        unit: 'รีม',
        currentStock: 50,
        minimumStock: 10,
        imageUrl: '/images/paper-a4.jpg',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '4',
        code: 'STAPLER-001',
        name: 'เครื่องเย็บกระดาษ ขนาดกลาง',
        description: 'เครื่องเย็บกระดาษ ขนาดกลาง เย็บได้ 20 แผ่น',
        category: 'อุปกรณ์สำนักงาน',
        unit: 'เครื่อง',
        currentStock: 25,
        minimumStock: 5,
        imageUrl: '/images/stapler.jpg',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '5',
        code: 'CLIP-001',
        name: 'คลิปหนีบกระดาษ ขนาดเล็ก',
        description: 'คลิปหนีบกระดาษ ขนาดเล็ก สีเงิน บรรจุ 100 ชิ้น/กล่อง',
        category: 'อุปกรณ์สำนักงาน',
        unit: 'กล่อง',
        currentStock: 30,
        minimumStock: 5,
        imageUrl: '/images/paper-clip.jpg',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '6',
        code: 'FOLDER-001',
        name: 'แฟ้มเอกสาร สีเหลือง',
        description: 'แฟ้มเอกสาร พลาสติก สีเหลือง ขนาด A4',
        category: 'อุปกรณ์สำนักงาน',
        unit: 'เล่ม',
        currentStock: 15,
        minimumStock: 10,
        imageUrl: '/images/folder-yellow.jpg',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '7',
        code: 'MARKER-001',
        name: 'ปากกาเมจิก สีดำ',
        description: 'ปากกาเมจิก หัวใหญ่ สีดำ เขียนบนกระดาน',
        category: 'เครื่องเขียน',
        unit: 'ด้าม',
        currentStock: 8,
        minimumStock: 15,
        imageUrl: '/images/marker-black.jpg',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '8',
        code: 'ERASER-001',
        name: 'ยางลบ ขาว',
        description: 'ยางลบ สีขาว ลบคมชัด ไม่ทิ้งคราบ',
        category: 'เครื่องเขียน',
        unit: 'ก้อน',
        currentStock: 0,
        minimumStock: 20,
        imageUrl: '/images/eraser-white.jpg',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '9',
        code: 'TAPE-001',
        name: 'เทปใส ขนาด 1 นิ้ว',
        description: 'เทปใสกาวในตัว ขนาด 1 นิ้ว ยาว 50 เมตร',
        category: 'อุปกรณ์สำนักงาน',
        unit: 'ม้วน',
        currentStock: 40,
        minimumStock: 10,
        imageUrl: '/images/tape-clear.jpg',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '10',
        code: 'NOTEBOOK-001',
        name: 'สมุดโน้ต A5 เส้นบรรทัด',
        description: 'สมุดโน้ต ขนาด A5 กระดาษเส้นบรรทัด 100 หน้า',
        category: 'เครื่องเขียน',
        unit: 'เล่ม',
        currentStock: 35,
        minimumStock: 10,
        imageUrl: '/images/notebook-a5.jpg',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];

    // Sample notices
    this.notices = [
      {
        id: '1',
        title: 'ประกาศ: การปรับปรุงระบบคลังสินค้า',
        content: 'ระบบคลังสินค้าจะมีการปรับปรุงในวันที่ 15-16 ธันวาคม 2024 อาจมีการหน่วงเวลาในการอนุมัติคำขอ',
        isActive: true,
        createdBy: '1',
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-01'),
      },
      {
        id: '2',
        title: 'แจ้งเตือน: สินค้าใกล้หมด',
        content: 'มีสินค้าหลายรายการที่มีจำนวนใกล้หมด กรุณาตรวจสอบก่อนทำการเบิก',
        isActive: true,
        createdBy: '1',
        createdAt: new Date('2024-12-05'),
        updatedAt: new Date('2024-12-05'),
      },
    ];

    // Sample requisitions
    this.requisitions = [
      {
        id: '1',
        documentNumber: 'REQ-2024-001',
        userId: '2',
        status: 'pending',
        items: [
          { inventoryItemId: '1', quantity: 5 },
          { inventoryItemId: '3', quantity: 2 }
        ],
        notes: 'สำหรับงานประจำเดือน',
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-01'),
      },
      {
        id: '2',
        documentNumber: 'REQ-2024-002',
        userId: '3',
        status: 'approved',
        items: [
          { inventoryItemId: '2', quantity: 10 },
          { inventoryItemId: '4', quantity: 1 }
        ],
        notes: 'เพื่อใช้ในการประชุม',
        createdAt: new Date('2024-12-02'),
        updatedAt: new Date('2024-12-03'),
        approvedBy: '1',
        approvedAt: new Date('2024-12-03'),
      },
      {
        id: '3',
        documentNumber: 'REQ-2024-003',
        userId: '2',
        status: 'draft',
        items: [
          { inventoryItemId: '5', quantity: 3 }
        ],
        notes: '',
        createdAt: new Date('2024-12-05'),
        updatedAt: new Date('2024-12-05'),
      }
    ];
  }

  // User operations
  async findAllUsers(): Promise<User[]> {
    await this.simulateDelay();
    return this.users.filter(user => user.isActive);
  }

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

  // Inventory operations
  async findAllInventory(filter?: { search?: string; category?: string; stockStatus?: string }): Promise<InventoryItem[]> {
    await this.simulateDelay();
    let items = this.inventory.filter(item => item.isActive);

    if (filter?.search) {
      const searchLower = filter.search.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.code.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      );
    }

    if (filter?.category && filter.category !== 'all') {
      items = items.filter(item => item.category === filter.category);
    }

    if (filter?.stockStatus && filter.stockStatus !== 'all') {
      switch (filter.stockStatus) {
        case 'in-stock':
          items = items.filter(item => item.currentStock > item.minimumStock);
          break;
        case 'low-stock':
          items = items.filter(item => item.currentStock <= item.minimumStock && item.currentStock > 0);
          break;
        case 'out-of-stock':
          items = items.filter(item => item.currentStock === 0);
          break;
      }
    }

    return items;
  }

  async findInventoryById(id: string): Promise<InventoryItem | null> {
    await this.simulateDelay();
    return this.inventory.find(item => item.id === id && item.isActive) || null;
  }

  async createInventoryItem(itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    await this.simulateDelay();
    const newItem: InventoryItem = {
      ...itemData,
      id: (this.inventory.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.inventory.push(newItem);
    return newItem;
  }

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> {
    await this.simulateDelay();
    const itemIndex = this.inventory.findIndex(item => item.id === id);
    if (itemIndex === -1) return null;

    this.inventory[itemIndex] = {
      ...this.inventory[itemIndex],
      ...updates,
      updatedAt: new Date(),
    };
    return this.inventory[itemIndex];
  }

  async deleteInventoryItem(id: string): Promise<boolean> {
    await this.simulateDelay();
    const itemIndex = this.inventory.findIndex(item => item.id === id);
    if (itemIndex === -1) return false;

    // Soft delete by setting isActive to false
    this.inventory[itemIndex].isActive = false;
    this.inventory[itemIndex].updatedAt = new Date();
    return true;
  }

  async getInventoryCategories(): Promise<string[]> {
    await this.simulateDelay();
    const categories = [...new Set(this.inventory.filter(item => item.isActive).map(item => item.category))];
    return categories.sort();
  }

  // Notice operations
  async findActiveNotices(): Promise<Notice[]> {
    await this.simulateDelay();
    return this.notices.filter(notice => notice.isActive).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findAllNotices(): Promise<Notice[]> {
    await this.simulateDelay();
    return this.notices.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findNoticeById(id: string): Promise<Notice | null> {
    await this.simulateDelay();
    return this.notices.find(notice => notice.id === id) || null;
  }

  async createNotice(noticeData: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notice> {
    await this.simulateDelay();
    const newNotice: Notice = {
      ...noticeData,
      id: (this.notices.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.notices.push(newNotice);
    return newNotice;
  }

  async updateNotice(id: string, updates: Partial<Notice>): Promise<Notice | null> {
    await this.simulateDelay();
    const noticeIndex = this.notices.findIndex(notice => notice.id === id);
    if (noticeIndex === -1) return null;

    this.notices[noticeIndex] = {
      ...this.notices[noticeIndex],
      ...updates,
      updatedAt: new Date(),
    };
    return this.notices[noticeIndex];
  }

  async deleteNotice(id: string): Promise<boolean> {
    await this.simulateDelay();
    const noticeIndex = this.notices.findIndex(notice => notice.id === id);
    if (noticeIndex === -1) return false;

    this.notices.splice(noticeIndex, 1);
    return true;
  }

  // Requisition operations
  async findAllRequisitions(filter?: { userId?: string; status?: string }): Promise<Requisition[]> {
    await this.simulateDelay();
    let requisitions = [...this.requisitions];

    if (filter?.userId) {
      requisitions = requisitions.filter(req => req.userId === filter.userId);
    }

    if (filter?.status && filter.status !== 'all') {
      requisitions = requisitions.filter(req => req.status === filter.status);
    }

    return requisitions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findRequisitionById(id: string): Promise<Requisition | null> {
    await this.simulateDelay();
    return this.requisitions.find(req => req.id === id) || null;
  }

  async createRequisition(requisitionData: Omit<Requisition, 'id' | 'documentNumber' | 'createdAt' | 'updatedAt'>): Promise<Requisition> {
    await this.simulateDelay();
    
    // Generate document number
    const year = new Date().getFullYear();
    const existingReqs = this.requisitions.filter(req => 
      req.documentNumber.startsWith(`REQ-${year}-`)
    );
    const nextNumber = existingReqs.length + 1;
    const documentNumber = `REQ-${year}-${nextNumber.toString().padStart(3, '0')}`;

    const newRequisition: Requisition = {
      ...requisitionData,
      id: (this.requisitions.length + 1).toString(),
      documentNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.requisitions.push(newRequisition);
    return newRequisition;
  }

  async updateRequisition(id: string, updates: Partial<Requisition>): Promise<Requisition | null> {
    await this.simulateDelay();
    const reqIndex = this.requisitions.findIndex(req => req.id === id);
    if (reqIndex === -1) return null;

    this.requisitions[reqIndex] = {
      ...this.requisitions[reqIndex],
      ...updates,
      updatedAt: new Date(),
    };
    return this.requisitions[reqIndex];
  }

  async deleteRequisition(id: string): Promise<boolean> {
    await this.simulateDelay();
    const reqIndex = this.requisitions.findIndex(req => req.id === id);
    if (reqIndex === -1) return false;

    this.requisitions.splice(reqIndex, 1);
    return true;
  }

  // Stock validation for requisitions
  async validateStockAvailability(items: RequisitionItem[]): Promise<{ valid: boolean; errors: string[] }> {
    await this.simulateDelay();
    const errors: string[] = [];

    for (const item of items) {
      const inventoryItem = await this.findInventoryById(item.inventoryItemId);
      if (!inventoryItem) {
        errors.push(`ไม่พบสินค้ารหัส ${item.inventoryItemId}`);
        continue;
      }

      if (inventoryItem.currentStock < item.quantity) {
        errors.push(`${inventoryItem.name} มีสต็อกไม่เพียงพอ (คงเหลือ ${inventoryItem.currentStock} ${inventoryItem.unit})`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Reduce stock when requisition is approved
  async reduceStock(items: RequisitionItem[]): Promise<boolean> {
    await this.simulateDelay();
    
    // First, validate all items can be reduced (atomic check)
    for (const item of items) {
      const inventoryItem = await this.findInventoryById(item.inventoryItemId);
      if (!inventoryItem || inventoryItem.currentStock < item.quantity) {
        return false;
      }
    }
    
    // If all items are valid, reduce stock for all
    for (const item of items) {
      const inventoryItem = await this.findInventoryById(item.inventoryItemId);
      if (inventoryItem) {
        await this.updateInventoryItem(item.inventoryItemId, {
          currentStock: inventoryItem.currentStock - item.quantity
        });
      }
    }
    
    return true;
  }

  // Audit trail operations
  async createAuditTrail(auditData: Omit<AuditTrail, 'id' | 'performedAt'>): Promise<AuditTrail> {
    await this.simulateDelay();
    const newAudit: AuditTrail = {
      ...auditData,
      id: (this.auditTrail.length + 1).toString(),
      performedAt: new Date(),
    };
    this.auditTrail.push(newAudit);
    return newAudit;
  }

  async findAuditTrail(filter?: { entityType?: string; entityId?: string; performedBy?: string }): Promise<AuditTrail[]> {
    await this.simulateDelay();
    let trails = [...this.auditTrail];

    if (filter?.entityType) {
      trails = trails.filter(trail => trail.entityType === filter.entityType);
    }

    if (filter?.entityId) {
      trails = trails.filter(trail => trail.entityId === filter.entityId);
    }

    if (filter?.performedBy) {
      trails = trails.filter(trail => trail.performedBy === filter.performedBy);
    }

    return trails.sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime());
  }

  // Enhanced requisition update with audit trail
  async updateRequisitionWithAudit(
    id: string, 
    updates: Partial<Requisition>, 
    performedBy: string,
    action: 'update' | 'approve' | 'reject' | 'issue' = 'update'
  ): Promise<Requisition | null> {
    await this.simulateDelay();
    const reqIndex = this.requisitions.findIndex(req => req.id === id);
    if (reqIndex === -1) return null;

    const oldRequisition = { ...this.requisitions[reqIndex] };
    
    this.requisitions[reqIndex] = {
      ...this.requisitions[reqIndex],
      ...updates,
      updatedAt: new Date(),
    };

    // Create audit trail
    await this.createAuditTrail({
      entityType: 'requisition',
      entityId: id,
      action,
      changes: {
        before: {
          status: oldRequisition.status,
          approvedBy: oldRequisition.approvedBy,
          approvedAt: oldRequisition.approvedAt,
          rejectionReason: oldRequisition.rejectionReason,
          issuedAt: oldRequisition.issuedAt
        },
        after: {
          status: this.requisitions[reqIndex].status,
          approvedBy: this.requisitions[reqIndex].approvedBy,
          approvedAt: this.requisitions[reqIndex].approvedAt,
          rejectionReason: this.requisitions[reqIndex].rejectionReason,
          issuedAt: this.requisitions[reqIndex].issuedAt
        }
      },
      performedBy,
      metadata: {
        documentNumber: this.requisitions[reqIndex].documentNumber,
        userId: this.requisitions[reqIndex].userId
      }
    });

    return this.requisitions[reqIndex];
  }

  // Stock adjustment operations
  async findAllStockAdjustments(filter?: { inventoryItemId?: string; type?: 'in' | 'out' }): Promise<StockAdjustment[]> {
    await this.simulateDelay();
    let adjustments = [...this.stockAdjustments];

    if (filter?.inventoryItemId) {
      adjustments = adjustments.filter(adj => adj.inventoryItemId === filter.inventoryItemId);
    }

    if (filter?.type) {
      adjustments = adjustments.filter(adj => adj.type === filter.type);
    }

    return adjustments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createStockAdjustment(adjustmentData: Omit<StockAdjustment, 'id' | 'createdAt'>): Promise<StockAdjustment | null> {
    await this.simulateDelay();
    
    // Verify inventory item exists
    const inventoryItem = await this.findInventoryById(adjustmentData.inventoryItemId);
    if (!inventoryItem) {
      return null;
    }

    // Calculate new stock level
    const newStock = adjustmentData.type === 'in' 
      ? inventoryItem.currentStock + adjustmentData.quantity
      : inventoryItem.currentStock - adjustmentData.quantity;

    // Prevent negative stock
    if (newStock < 0) {
      return null;
    }

    // Update inventory stock
    await this.updateInventoryItem(adjustmentData.inventoryItemId, {
      currentStock: newStock
    });

    // Create adjustment record
    const newAdjustment: StockAdjustment = {
      ...adjustmentData,
      id: (this.stockAdjustments.length + 1).toString(),
      createdAt: new Date(),
    };
    
    this.stockAdjustments.push(newAdjustment);
    return newAdjustment;
  }
}

// Export singleton instance
export const mockDb = MockDatabase.getInstance();