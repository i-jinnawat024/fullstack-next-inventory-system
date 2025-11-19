import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/database/mock-database';
import { verifyToken } from '@/lib/auth/jwt';
import { ApiResponse } from '@/lib/types';

interface RejectRequestBody {
  reason: string;
}

// POST /api/requisitions/[id]/reject - Reject requisition with comment (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบ' }
      }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Token ไม่ถูกต้อง' }
      }, { status: 401 });
    }

    // Only admins can reject requisitions
    if (payload.role !== 'admin') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'FORBIDDEN', message: 'ไม่มีสิทธิ์ปฏิเสธคำขอ' }
      }, { status: 403 });
    }

    const requisition = await mockDb.findRequisitionById(id);
    if (!requisition) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'NOT_FOUND', message: 'ไม่พบคำขอเบิกสินค้า' }
      }, { status: 404 });
    }

    // Can only reject pending requisitions
    if (requisition.status !== 'pending') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'สามารถปฏิเสธได้เฉพาะคำขอที่อยู่ในสถานะรอการอนุมัติ' }
      }, { status: 400 });
    }

    const body: RejectRequestBody = await request.json();

    // Validate rejection reason
    if (!body.reason || body.reason.trim().length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'INVALID_DATA', message: 'กรุณาระบุเหตุผลในการปฏิเสธ' }
      }, { status: 400 });
    }

    // Update requisition status to rejected with audit trail
    const updatedRequisition = await mockDb.updateRequisitionWithAudit(
      id, 
      {
        status: 'rejected',
        rejectionReason: body.reason.trim(),
        approvedBy: payload.userId, // Track who rejected it
        approvedAt: new Date() // Track when it was rejected
      },
      payload.userId,
      'reject'
    );

    if (!updatedRequisition) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'UPDATE_FAILED', message: 'ไม่สามารถอัปเดตสถานะคำขอได้' }
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedRequisition
    });

  } catch (error) {
    console.error('Error rejecting requisition:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาดภายในระบบ' }
    }, { status: 500 });
  }
}