// Application configuration constants

export const APP_CONFIG = {
  // Application info
  name: 'ระบบเบิกสินค้า',
  version: '1.0.0',
  description: 'ระบบจัดการการเบิกสินค้าและคลังสินค้า',
  
  // API configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: 30000,
    retries: 3,
  },
  
  // Authentication
  auth: {
    tokenKey: 'auth-token',
    refreshTokenKey: 'refresh-token',
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // Pagination
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  
  // File upload
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedImportTypes: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  },
  
  // Theme
  theme: {
    storageKey: 'inventory-theme',
    defaultTheme: 'light' as const,
  },
  
  // Stock levels
  stock: {
    lowStockThreshold: 0.2, // 20% of minimum stock
    outOfStockThreshold: 0,
  },
  
  // Document numbers
  documentNumber: {
    prefix: 'REQ',
    yearFormat: 'YYYY',
    sequenceLength: 4,
  },
  
  // Validation
  validation: {
    minPasswordLength: 6,
    maxDescriptionLength: 500,
    maxNotesLength: 1000,
  },
  
  // Mock database
  mockDb: {
    simulateDelay: true,
    minDelay: 100,
    maxDelay: 500,
  },
} as const;

export type AppConfig = typeof APP_CONFIG;