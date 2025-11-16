# Design Document

## Overview

The Inventory Requisition System is a full-stack Next.js 15 application using the App Router architecture. The system provides a complete inventory management solution with Thai localization, theme switching, and enterprise-ready features. The architecture follows modern React patterns with Server Components for data fetching and Client Components for interactivity.

## Architecture

### Technology Stack
- **Frontend**: Next.js 15 App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js Route Handlers (API Routes)
- **State Management**: Zustand for client state, React Server Components for server state
- **Authentication**: JWT simulation with HTTP-only cookies
- **Database**: Mock in-memory arrays with JSON persistence simulation
- **PDF Generation**: jsPDF for client-side PDF export
- **Styling**: CSS Variables for theming, Tailwind for utility classes

### Folder Structure
```
app/
├── (auth)/
│   ├── login/
│   └── forgot-password/
├── (dashboard)/
│   ├── inventory/
│   ├── requisitions/
│   │   ├── create/
│   │   └── history/
│   └── admin/
│       ├── approvals/
│       ├── products/
│       ├── stock-adjustments/
│       ├── notices/
│       ├── import/
│       └── reports/
├── api/
│   ├── auth/
│   ├── inventory/
│   ├── requisitions/
│   ├── stock-adjustments/
│   ├── notices/
│   ├── import/
│   └── reports/
├── components/
│   ├── ui/
│   ├── forms/
│   ├── tables/
│   └── layout/
├── lib/
│   ├── auth/
│   ├── database/
│   ├── utils/
│   └── types/
└── globals.css
```

## Components and Interfaces

### Core Layout Components

#### AppLayout
- Responsive sidebar navigation with role-based menu items
- Top navigation bar with user info and theme toggle
- Breadcrumb navigation
- Mobile-responsive hamburger menu

#### ThemeProvider
- CSS variable-based theme system
- localStorage persistence
- Floating theme toggle button
- Support for light/dark modes

### UI Components

#### DataTable
- Generic table component with sorting, filtering, pagination
- Thai language support for all labels
- Responsive design with horizontal scroll
- Action buttons integration

#### Modal
- Reusable modal component with backdrop
- Form integration support
- Mobile-responsive sizing
- Thai language close/cancel buttons

#### FormComponents
- Input, Select, Textarea with Thai labels
- Validation error display in Thai
- Consistent styling with theme variables
- Required field indicators

### Business Components

#### InventorySelector
- Modal-based inventory item selection
- Search and filter capabilities
- Stock level validation
- Multi-select with quantity input

#### RequisitionForm
- Dynamic line item management
- Auto-generated document numbers
- Draft save functionality
- Validation with Thai error messages

#### ApprovalQueue
- Requisition review interface
- Bulk approval capabilities
- Comment system for rejections
- Status update tracking

## Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  password: string; // hashed
  name: string;
  role: 'user' | 'admin';
  department: string;
  createdAt: Date;
  isActive: boolean;
}
```

### InventoryItem Model
```typescript
interface InventoryItem {
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
```

### Requisition Model
```typescript
interface Requisition {
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

interface RequisitionItem {
  inventoryItemId: string;
  quantity: number;
  unitPrice?: number;
}
```

### StockAdjustment Model
```typescript
interface StockAdjustment {
  id: string;
  inventoryItemId: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  adjustedBy: string;
  createdAt: Date;
}
```

### Notice Model
```typescript
interface Notice {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## API Design

### Authentication Endpoints
- `POST /api/auth/login` - User authentication with JWT generation
- `POST /api/auth/forgot` - Password reset request
- `POST /api/auth/logout` - Session termination
- `GET /api/auth/me` - Current user profile

### Inventory Endpoints
- `GET /api/inventory` - List inventory items with filtering
- `GET /api/inventory/[id]` - Get specific inventory item
- `POST /api/inventory` - Create new inventory item (admin)
- `PATCH /api/inventory/[id]` - Update inventory item (admin)
- `DELETE /api/inventory/[id]` - Soft delete inventory item (admin)

### Requisition Endpoints
- `GET /api/requisitions` - List user's requisitions or all (admin)
- `POST /api/requisitions` - Create new requisition
- `GET /api/requisitions/[id]` - Get specific requisition
- `PATCH /api/requisitions/[id]` - Update requisition (draft only)
- `POST /api/requisitions/[id]/approve` - Approve requisition (admin)
- `POST /api/requisitions/[id]/reject` - Reject requisition (admin)
- `POST /api/requisitions/[id]/issue` - Mark as issued (admin)

### Stock Management Endpoints
- `GET /api/stock-adjustments` - List stock adjustments
- `POST /api/stock-adjustments` - Create stock adjustment (admin)
- `GET /api/reports` - Generate usage reports (admin)

### System Endpoints
- `GET /api/notices` - Get active notices
- `POST /api/notices` - Create notice (admin)
- `PATCH /api/notices/[id]` - Update notice (admin)
- `POST /api/import` - Import inventory data (admin)

## Authentication & Authorization

### JWT Implementation
- HTTP-only cookies for token storage
- Middleware for route protection
- Role-based access control
- Session refresh mechanism

### Route Protection
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const { pathname } = request.nextUrl;
  
  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    return verifyAdminAccess(token);
  }
  
  // Protect authenticated routes
  if (pathname.startsWith('/dashboard')) {
    return verifyUserAccess(token);
  }
}
```

## Theme System

### CSS Variables Implementation
```css
:root {
  --color-primary: #2563eb;
  --color-primary-dark: #1e3a8a;
  --color-bg: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-text: #111827;
  --color-text-secondary: #4b5563;
  --color-surface: #ffffff;
  --color-border: #e5e7eb;
}

[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-text: #e2e8f0;
  --color-text-secondary: #94a3b8;
  --color-surface: #1e293b;
  --color-border: #334155;
}
```

### Theme Toggle Component
- Floating action button positioned fixed
- Icon switching between sun/moon
- Smooth transitions between themes
- Persistence in localStorage

## Localization Strategy

### Thai Language Implementation
- All user-facing text in Thai
- Date formatting as DD/MM/YYYY
- Number formatting with Thai locale
- Error messages and validation in Thai
- Navigation and button labels in Thai

### Text Constants
```typescript
export const THAI_LABELS = {
  inventory: 'รายการสินค้าในสต็อก',
  requisition: 'เบิกสินค้า',
  quantity: 'จำนวน',
  remaining: 'คงเหลือ',
  confirm: 'ยืนยัน',
  cancel: 'ยกเลิก',
  approve: 'อนุมัติ',
  reject: 'ปฏิเสธ',
  // ... more labels
};
```

## Mock Database Design

### In-Memory Storage
```typescript
class MockDatabase {
  private users: User[] = [];
  private inventory: InventoryItem[] = [];
  private requisitions: Requisition[] = [];
  private stockAdjustments: StockAdjustment[] = [];
  private notices: Notice[] = [];
  
  // CRUD operations with delay simulation
  async findMany<T>(collection: string, filter?: any): Promise<T[]> {
    await this.simulateDelay();
    // Implementation
  }
  
  private async simulateDelay(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}
```

### Initial Data Seeding
- Sample inventory items with Thai names
- Test user accounts (user/admin roles)
- Sample requisitions in various states
- Default warehouse notices

## Error Handling

### API Error Responses
```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Client Error Handling
- Toast notifications for user feedback
- Form validation with Thai error messages
- Network error recovery
- Loading states for all async operations

## Testing Strategy

### Component Testing
- Unit tests for utility functions
- Component rendering tests
- Form validation testing
- Theme switching functionality

### API Testing
- Route handler testing
- Mock database operations
- Authentication flow testing
- Error scenario testing

### Integration Testing
- End-to-end user workflows
- Admin approval processes
- Data consistency validation
- Cross-browser compatibility

## Performance Considerations

### Optimization Strategies
- Server Components for initial data loading
- Client Components only where interactivity needed
- Image optimization for product photos
- Lazy loading for large tables
- Debounced search inputs

### Caching Strategy
- Static generation for public pages
- Dynamic rendering for user-specific content
- Client-side caching for frequently accessed data
- API response caching where appropriate

## Security Measures

### Data Protection
- Input validation and sanitization
- SQL injection prevention (future database)
- XSS protection
- CSRF token implementation

### Authentication Security
- Password hashing (bcrypt simulation)
- JWT token expiration
- Secure cookie settings
- Rate limiting for auth endpoints

## Future Extensibility

### Prepared Infrastructure
- RBAC service structure
- Notification service hooks
- Advanced reporting framework
- PWA manifest and service worker setup
- Webhook endpoint structure
- Real database migration interfaces

### Scalability Considerations
- Modular component architecture
- Separation of concerns
- Type-safe API contracts
- Environment-based configuration
- Docker containerization readiness