import { headers } from 'next/headers';
import { AuthUser } from '@/lib/types';

/**
 * Get current authenticated user from request headers
 * This function should only be used in Server Components or Server Actions
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const headersList = await headers();
  
  const userId = headersList.get('x-user-id');
  const role = headersList.get('x-user-role');
  const email = headersList.get('x-user-email');
  const nameBase64 = headersList.get('x-user-name');
  const departmentBase64 = headersList.get('x-user-department');

  if (!userId || !role || !email || !nameBase64 || !departmentBase64) {
    return null;
  }

  // Decode base64 encoded Thai characters
  const name = Buffer.from(nameBase64, 'base64').toString('utf8');
  const department = Buffer.from(departmentBase64, 'base64').toString('utf8');

  return {
    id: userId,
    email,
    name,
    role: role as 'user' | 'admin',
    department,
  };
}
