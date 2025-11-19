# Authentication and Authorization System

This directory contains the authentication and authorization utilities for the application.

## Files Overview

### `jwt.ts`
JWT token generation, verification, and password hashing utilities.

**Key Functions:**
- `generateToken()` - Generate JWT access or refresh token
- `generateAuthTokens()` - Generate both access and refresh tokens
- `verifyToken()` - Verify and decode JWT token
- `verifyAuth()` - Verify authentication from request
- `hashPassword()` - Hash password for storage
- `comparePassword()` - Compare password with hash

### `authorization.ts`
Authorization utilities for API routes with reusable permission checks.

**Key Functions:**
- `requireAuth()` - Require user to be authenticated
- `requireAdmin()` - Require user to be authenticated and have admin role
- `requireOwnerOrAdmin()` - Require user to be owner of resource or admin
- `hasRole()` - Check if user has specific role
- `isAdmin()` - Check if user is admin
- `isOwner()` - Check if user owns resource

**Usage Example:**
```typescript
import { requireAdmin } from '@/lib/auth/authorization';

export async function GET(request: NextRequest) {
  // Check authentication and admin role
  const authResult = await requireAdmin(request);
  if (!authResult.authorized) {
    return authResult.response!;
  }
  
  // User is authenticated and is admin
  const user = authResult.user;
  // ... rest of handler
}
```

### `client-auth.ts`
Client-side authentication utilities for React components.

**Key Functions:**
- `handleAuthError()` - Handle authentication errors and redirect
- `handleAdminAuthError()` - Handle admin route authentication errors
- `getErrorMessage()` - Extract error message from API response
- `isAuthError()` - Check if response is authentication error

**Usage Example:**
```typescript
import { handleAdminAuthError } from '@/lib/auth/client-auth';

const response = await fetch('/api/admin/users');
if (handleAdminAuthError(response, router)) {
  return; // User was redirected
}
```

### `server.ts`
Server-side utilities for getting current user in Server Components.

**Key Functions:**
- `getCurrentUser()` - Get current authenticated user from headers

## Authorization Flow

### 1. Middleware Layer (`middleware.ts`)
- Runs on every request
- Checks authentication tokens
- Validates admin role for `/admin` routes
- Sets user headers for downstream use
- Redirects unauthorized users

### 2. API Route Layer
- Uses `requireAuth()` or `requireAdmin()` helpers
- Returns appropriate error responses
- Provides user information to handler

### 3. Client Layer
- Handles authentication errors
- Redirects to appropriate pages
- Displays error messages

## Route Protection

### Public Routes
Routes that don't require authentication:
- `/login`
- `/forgot-password`
- `/api/auth/*`

### Protected Routes
Routes that require authentication:
- `/dashboard`
- `/profile`
- All other routes not in public list

### Admin Routes
Routes that require admin role:
- `/admin/*`
- `/api/admin/*`

## Error Codes

### Authentication Errors
- `UNAUTHORIZED` (401) - User not authenticated
- `FORBIDDEN` (403) - User authenticated but lacks permission
- `INVALID_TOKEN` (401) - Token is invalid or expired

### Error Messages (Thai)
- `กรุณาเข้าสู่ระบบ` - Please login
- `คุณไม่มีสิทธิ์เข้าถึงฟีเจอร์นี้` - You don't have permission
- `ต้องมีสิทธิ์ผู้ดูแลระบบ` - Admin permission required

## Best Practices

1. **API Routes**: Always use `requireAuth()` or `requireAdmin()` at the start of handlers
2. **Client Components**: Use `handleAuthError()` to handle API responses
3. **Server Components**: Use `getCurrentUser()` to get user information
4. **Error Handling**: Always return the response from authorization helpers
5. **Consistency**: Use the same error messages across the application

## Security Considerations

1. **Token Storage**: Tokens stored in httpOnly cookies
2. **Token Refresh**: Automatic refresh using refresh token
3. **Password Hashing**: Passwords hashed before storage
4. **Role-Based Access**: Admin routes protected at middleware level
5. **Session Management**: User headers set by middleware for each request
