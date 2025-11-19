import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, AuthUser } from '@/lib/types';
import { verifyAuth } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);

    if (!authResult.valid || !authResult.user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized access. Please login again.',
        },
      }, { status: 401 });
    }

    return NextResponse.json<ApiResponse<AuthUser>>({
      success: true,
      data: authResult.user,
    });
  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error. Please try again later.',
      },
    }, { status: 500 });
  }
}
