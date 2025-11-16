// Core data models for the Inventory Requisition System

export interface User {
  id: string;
  email: string;
  password: string; // hashed
  name: string;
  role: 'user' | 'admin';
  department: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequisitionItem {
  inventoryItemId: string;
  quantity: number;
  unitPrice?: number;
}

export interface Requisition {
  id: string;
  documentNumber: string;
  userId: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'issued';
  items: RequisitionItem[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  issuedAt?: Date;
}

export interface StockAdjustment {
  id: string;
  inventoryItemId: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  adjustedBy: string;
  createdAt: Date;
}

export interface AuditTrail {
  id: string;
  entityType: 'requisition' | 'inventory' | 'user';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'issue';
  changes: Record<string, any>;
  performedBy: string;
  performedAt: Date;
  metadata?: Record<string, any>;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  department: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  iat: number;
  exp: number;
}

// Form types
export interface CreateInventoryItemForm {
  code: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  imageUrl?: string;
}

export interface CreateRequisitionForm {
  items: {
    inventoryItemId: string;
    quantity: number;
  }[];
  notes?: string;
}

export interface StockAdjustmentForm {
  inventoryItemId: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
}

export interface NoticeForm {
  title: string;
  content: string;
  isActive: boolean;
}

// Filter and search types
export interface InventoryFilter {
  search?: string;
  category?: string;
  stockStatus?: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
}

export interface RequisitionFilter {
  status?: Requisition['status'];
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ReportFilter {
  userId?: string;
  productId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Theme types
export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Import types
export interface ImportData {
  code: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: {
    row: number;
    message: string;
  }[];
}

// Report types
export interface RequisitionReport {
  totalRequisitions: number;
  approvedRequisitions: number;
  rejectedRequisitions: number;
  pendingRequisitions: number;
  mostRequestedItems: {
    itemId: string;
    itemName: string;
    totalRequested: number;
  }[];
  userActivity: {
    userId: string;
    userName: string;
    totalRequisitions: number;
  }[];
}

export interface InventoryReport {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  categoryBreakdown: {
    category: string;
    itemCount: number;
    totalValue: number;
  }[];
}

// Utility types
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type CreateType<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateType<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;