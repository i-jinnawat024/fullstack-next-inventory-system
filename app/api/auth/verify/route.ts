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
          message: '�1,�,��1^�,z�,s�,,�1%�,-�,��,1�,��,o�,1�1%�1��,S�1%',
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
        message: '�1?�,?�,'�,"�,,�1%�,-�,o�,'�,"�,z�,��,��,"�,��,��,��1��,T�,��,��,s�,s',
      },
    }, { status: 500 });
  }
}
