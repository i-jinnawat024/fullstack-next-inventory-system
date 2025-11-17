import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, AuthUser } from '@/lib/types';
import { mockDb } from '@/lib/database/mock-database';
import {
  verifyRefreshToken,
  generateAuthTokens,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh-token')?.value;

    if (!refreshToken) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'กรุณาเข้าสู่ระบบ',
        },
      }, { status: 401 });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      const response = NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token ไม่ถูกต้องหรือหมดอายุแล้ว',
        },
      }, { status: 401 });
      response.cookies.delete('auth-token');
      response.cookies.delete('refresh-token');
      return response;
    }

    const user = await mockDb.findUserById(payload.userId);
    if (!user || !user.isActive) {
      const response = NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'ไม่พบผู้ใช้หรือบัญชีถูกปิดใช้งาน',
        },
      }, { status: 404 });
      response.cookies.delete('auth-token');
      response.cookies.delete('refresh-token');
      return response;
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
    };

    const { accessToken, refreshToken: rotatedRefreshToken } = generateAuthTokens(authUser);
    const response = NextResponse.json<ApiResponse<AuthUser>>({
      success: true,
      data: authUser,
    });

    response.cookies.set('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: '/',
    });

    response.cookies.set('refresh-token', rotatedRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
          message: 'เกิดข้อผิดพลาดภายในระบบ',
      },
    }, { status: 500 });
  }
}
