import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { userService } from '@/lib/services/user.service';
import { UserError } from '@/lib/types/user-management';
import { createUserSchema } from '@/lib/validations/user-schemas';

/**
 * GET /api/admin/users
 * Get all users (admin only)
 * Returns list of active users sorted by createdAt descending
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const authResult = await requireAdmin(request);
    if (!authResult.authorized) {
      return authResult.response!;
    }

    // Fetch all active users
    const users = await userService.getAllUsers({ isActive: true });

    return NextResponse.json({
      success: true,
      data: {
        users,
        total: users.length,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    
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
 * POST /api/admin/users
 * Create new user (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const authResult = await requireAdmin(request);
    if (!authResult.authorized) {
      return authResult.response!;
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createUserSchema.safeParse(body);

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

    // Create user
    const newUser = await userService.createUser(validationResult.data);

    return NextResponse.json(
      {
        success: true,
        data: newUser,
        message: 'สร้างผู้ใช้งานสำเร็จ',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    
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
          message: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน' 
        } 
      },
      { status: 500 }
    );
  }
}
