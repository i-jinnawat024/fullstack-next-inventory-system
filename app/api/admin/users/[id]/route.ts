import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { userService } from '@/lib/services/user.service';
import { UserError } from '@/lib/types/user-management';
import { updateUserSchema } from '@/lib/validations/user-schemas';

/**
 * GET /api/admin/users/[id]
 * Get user by ID (admin only)
 */
export async function GET(
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

    // Fetch user by ID
    const user = await userService.getUserById(id);

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    
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
          message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน' 
        } 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[id]
 * Update user (admin only)
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
    const validationResult = updateUserSchema.safeParse(body);

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

    // Update user
    const updatedUser = await userService.updateUser(id, validationResult.data);

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'อัพเดทข้อมูลผู้ใช้งานสำเร็จ',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    
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
          message: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูลผู้ใช้งาน' 
        } 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete user (admin only) - soft delete by setting isActive to false
 */
export async function DELETE(
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

    // Delete user (soft delete)
    await userService.updateUser(id, { isActive: false });

    return NextResponse.json({
      success: true,
      message: 'ลบผู้ใช้งานสำเร็จ',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    
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
          message: 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน' 
        } 
      },
      { status: 500 }
    );
  }
}
