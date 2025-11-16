import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json<ApiResponse>({
      success: true,
      data: { message: 'ออกจากระบบเรียบร้อยแล้ว' }
    });

    // Clear the auth token cookie
    response.cookies.delete('auth-token');

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'เกิดข้อผิดพลาดภายในระบบ'
      }
    }, { status: 500 });
  }
}