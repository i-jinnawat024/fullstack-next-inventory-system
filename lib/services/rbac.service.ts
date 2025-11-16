/**
 * Role-Based Access Control Service
 * 
 * This service provides infrastructure for future RBAC implementation.
 * Currently uses basic role checking, but can be extended to support:
 * - Fine-grained permissions
 * - Resource-based access control
 * - Dynamic role assignment
 * - Permission inheritance
 */

export type Permission = 
  | 'inventory:read'
  | 'inventory:write'
  | 'inventory:delete'
  | 'requisition:create'
  | 'requisition:read'
  | 'requisition:approve'
  | 'requisition:reject'
  | 'stock:adjust'
  | 'reports:view'
  | 'users:manage'
  | 'notices:manage';

export type Role = 'user' | 'admin' | 'manager' | 'viewer';

// Future: Load from database
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  viewer: ['inventory:read', 'requisition:read'],
  user: [
    'inventory:read',
    'requisition:create',
    'requisition:read',
  ],
  manager: [
    'inventory:read',
    'inventory:write',
    'requisition:create',
    'requisition:read',
    'requisition:approve',
    'requisition:reject',
    'stock:adjust',
    'reports:view',
  ],
  admin: [
    'inventory:read',
    'inventory:write',
    'inventory:delete',
    'requisition:create',
    'requisition:read',
    'requisition:approve',
    'requisition:reject',
    'stock:adjust',
    'reports:view',
    'users:manage',
    'notices:manage',
  ],
};

export class RBACService {
  /**
   * Check if a role has a specific permission
   */
  static hasPermission(role: Role, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
  }

  /**
   * Check if a role has any of the specified permissions
   */
  static hasAnyPermission(role: Role, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(role, permission));
  }

  /**
   * Check if a role has all of the specified permissions
   */
  static hasAllPermissions(role: Role, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(role, permission));
  }

  /**
   * Get all permissions for a role
   */
  static getPermissions(role: Role): Permission[] {
    return ROLE_PERMISSIONS[role] ?? [];
  }

  /**
   * Future: Load permissions from database
   */
  static async loadPermissionsFromDatabase(userId: string): Promise<Permission[]> {
    // TODO: Implement database lookup
    throw new Error('Not implemented - requires database connection');
  }

  /**
   * Future: Check resource-based permissions
   */
  static async canAccessResource(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string
  ): Promise<boolean> {
    // TODO: Implement resource-based access control
    throw new Error('Not implemented - requires database connection');
  }
}
