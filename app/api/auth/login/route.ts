import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/database/mock-database';
import { generateToken, comparePassword } from '@/lib/auth/jwt';
import { LoginCredentials, ApiResponse, AuthUser } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'กรุณากรอกอีเมลและรหัสผ่าน',
          details: { email: !email, password: !password }
        }
      }, { status: 400 });
    }

    // Find user by email
    const user = await mockDb.findUserByEmail(email);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
        }
      }, { status: 401 });
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'ACCOUNT_DISABLED',
          message: 'บัญชีผู้ใช้ถูกปิดใช้งาน'
        }
      }, { status: 401 });
    }

    // Verify password
    const isValidPassword = comparePassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
        }
      }, { status: 401 });
    }

    // Create auth user object (without password)
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department
    };

    // Generate JWT token
    const token = generateToken(authUser);

    // Create response
    const response = NextResponse.json<ApiResponse<AuthUser>>({
      success: true,
      data: authUser
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'เกิดข้อผิดพลาดภายในระบบ'
      }
    }, { status: 500 });
  }
}