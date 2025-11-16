import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/database/mock-database';
import { ApiResponse } from '@/lib/types';
import { verifyAuth } from '@/lib/auth/jwt';

// GET /api/auth/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const authResult = await verifyAuth(request);
    if (!authResult.valid || authResult.user?.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'ไม่มีสิทธิ์เข้าถึง',
          },
        } as ApiResponse,
        { status: 403 }
      );
    }

    const users = await mockDb.findAllUsers();

    // Remove password from response
    const sanitizedUsers = users.map(({ password, ...user }) => user);

    return NextResponse.json(
      {
        success: true,
        data: sanitizedUsers,
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'เกิดข้อผิดพลาดภายในระบบ',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      } as ApiResponse,
      { status: 500 }
    );
  }
}
