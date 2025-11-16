import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/database/mock-database';
import { ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate input
    if (!email) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'กรุณากรอกอีเมล'
        }
      }, { status: 400 });
    }

    // Check if user exists
    const user = await mockDb.findUserByEmail(email);
    
    // Always return success for security reasons (don't reveal if email exists)
    // In a real application, you would send a password reset email here
    return NextResponse.json<ApiResponse>({
      success: true,
      data: { 
        message: 'หากอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านไปให้คุณ' 
      }
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'เกิดข้อผิดพลาดภายในระบบ'
      }
    }, { status: 500 });
  }
}