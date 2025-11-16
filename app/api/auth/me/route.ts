import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/database/mock-database';
import { ApiResponse, AuthUser } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from middleware headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'ไม่พบข้อมูลผู้ใช้'
        }
      }, { status: 401 });
    }

    // Get user from database
    const user = await mockDb.findUserById(userId);
    if (!user || !user.isActive) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'ไม่พบข้อมูลผู้ใช้'
        }
      }, { status: 404 });
    }

    // Create auth user object (without password)
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department
    };

    return NextResponse.json<ApiResponse<AuthUser>>({
      success: true,
      data: authUser
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'เกิดข้อผิดพลาดภายในระบบ'
      }
    }, { status: 500 });
  }
}