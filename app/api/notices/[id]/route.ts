import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/database/mock-database';
import { verifyToken } from '@/lib/auth/jwt';
import { NoticeForm } from '@/lib/types';

// GET /api/notices/[id] - Get specific notice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'ไม่มีสิทธิ์เข้าถึง' } },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TOKEN', message: 'Token ไม่ถูกต้อง' } },
        { status: 401 }
      );
    }

    const notice = await mockDb.findNoticeById(id);

    if (!notice) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'ไม่พบประกาศ' } },
        { status: 404 }
      );
    }

    // Non-admins can only view active notices
    if (payload.role !== 'admin' && !notice.isActive) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'ไม่พบประกาศ' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notice
    });
  } catch (error) {
    console.error('Error fetching notice:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาดภายในระบบ' } },
      { status: 500 }
    );
  }
}

// PATCH /api/notices/[id] - Update notice (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'ไม่มีสิทธิ์เข้าถึง' } },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TOKEN', message: 'Token ไม่ถูกต้อง' } },
        { status: 401 }
      );
    }

    // Only admins can update notices
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'ไม่อนุญาตให้เข้าถึง' } },
        { status: 403 }
      );
    }

    // Parse request body
    const body: Partial<NoticeForm> = await request.json();

    // Update notice
    const updatedNotice = await mockDb.updateNotice(id, body);

    if (!updatedNotice) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'ไม่พบประกาศ' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedNotice
    });
  } catch (error) {
    console.error('Error updating notice:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาดภายในระบบ' } },
      { status: 500 }
    );
  }
}

// DELETE /api/notices/[id] - Delete notice (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'ไม่มีสิทธิ์เข้าถึง' } },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TOKEN', message: 'Token ไม่ถูกต้อง' } },
        { status: 401 }
      );
    }

    // Only admins can delete notices
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'ไม่อนุญาตให้เข้าถึง' } },
        { status: 403 }
      );
    }

    const success = await mockDb.deleteNotice(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'ไม่พบประกาศ' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'ลบประกาศสำเร็จ' }
    });
  } catch (error) {
    console.error('Error deleting notice:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาดภายในระบบ' } },
      { status: 500 }
    );
  }
}
