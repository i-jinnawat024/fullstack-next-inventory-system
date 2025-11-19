import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/authorization';
import { userService } from '@/lib/services/user.service';
import { UserError } from '@/lib/types/user-management';
import { changePasswordSchema } from '@/lib/validations/user-schemas';

/**
 * PUT /api/profile/password
 * Change current user's password
 * Requires authentication
 * Validates current password before updating
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAuth(request);
    if (!authResult.authorized || !authResult.user) {
      return authResult.response!;
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = changePasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'ข้อมูลไม่ถูกต้อง',
            details: validationResult.error.flatten().fieldErrors,
          } 
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Change password (service validates current password and updates)
    await userService.changePassword(
      authResult.user.id,
      currentPassword,
      newPassword
    );

    return NextResponse.json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    
    if (error instanceof UserError) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: error.code, 
            message: error.message 
          } 
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' 
        } 
      },
      { status: 500 }
    );
  }
}
