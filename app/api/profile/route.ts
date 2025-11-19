import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/authorization';
import { userService } from '@/lib/services/user.service';
import { UserError } from '@/lib/types/user-management';
import { updateProfileSchema } from '@/lib/validations/user-schemas';

/**
 * GET /api/profile
 * Get current user's profile
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAuth(request);
    if (!authResult.authorized || !authResult.user) {
      return authResult.response!;
    }

    // Fetch current user's profile
    const userProfile = await userService.getUserProfile(authResult.user.id);

    return NextResponse.json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    
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
          message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์' 
        } 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Update current user's profile
 * Requires authentication
 * Users can only update their own firstName, lastName, and email
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
    const validationResult = updateProfileSchema.safeParse(body);

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

    // Update profile (service ensures only allowed fields are updated)
    const updatedProfile = await userService.updateProfile(
      authResult.user.id,
      validationResult.data
    );

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'อัพเดทข้อมูลโปรไฟล์สำเร็จ',
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    
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
          message: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูลโปรไฟล์' 
        } 
      },
      { status: 500 }
    );
  }
}
