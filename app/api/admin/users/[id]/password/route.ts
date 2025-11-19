import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { userService } from '@/lib/services/user.service';
import { UserError } from '@/lib/types/user-management';
import { resetPasswordSchema } from '@/lib/validations/user-schemas';

/**
 * PUT /api/admin/users/[id]/password
 * Update user password (admin only - password reset)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication and admin role
    const authResult = await requireAdmin(request);
    if (!authResult.authorized) {
      return authResult.response!;
    }

    const { id } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = resetPasswordSchema.safeParse(body);

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

    // Update user password
    await userService.updateUserPassword(id, validationResult.data.newPassword);

    return NextResponse.json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ',
    });
  } catch (error) {
    console.error('Error updating user password:', error);
    
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
