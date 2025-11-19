import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/database/mock-database';
import { verifyToken } from '@/lib/auth/jwt';
import { ApiResponse } from '@/lib/types';

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบ' }
      }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Token ไม่ถูกต้อง' }
      }, { status: 401 });
    }

    // Only admins can view all users
    if (payload.role !== 'admin') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'FORBIDDEN', message: 'ไม่มีสิทธิ์เข้าถึงข้อมูลผู้ใช้' }
      }, { status: 403 });
    }

    const users = await mockDb.findAllUsers();

    // Remove password from response
    const sanitizedUsers = users.map(({ password, ...user }) => user);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: sanitizedUsers
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาดภายในระบบ' }
    }, { status: 500 });
  }
}
