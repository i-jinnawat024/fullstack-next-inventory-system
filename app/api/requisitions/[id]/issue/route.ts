import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/database/mock-database';
import { verifyToken } from '@/lib/auth/jwt';
import { ApiResponse } from '@/lib/types';

// POST /api/requisitions/[id]/issue - Mark requisition as issued (admin only)
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

    // Only admins can mark requisitions as issued
    if (payload.role !== 'admin') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'FORBIDDEN', message: 'ไม่มีสิทธิ์จ่ายสินค้า' }
      }, { status: 403 });
    }

    const requisition = await mockDb.findRequisitionById(id);
    if (!requisition) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'NOT_FOUND', message: 'ไม่พบคำขอเบิกสินค้า' }
      }, { status: 404 });
    }

    // Can only issue approved requisitions
    if (requisition.status !== 'approved') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'สามารถจ่ายสินค้าได้เฉพาะคำขอที่ได้รับการอนุมัติแล้ว' }
      }, { status: 400 });
    }

    // Update requisition status to issued with audit trail
    const updatedRequisition = await mockDb.updateRequisitionWithAudit(
      id, 
      {
        status: 'issued',
        issuedAt: new Date()
      },
      payload.userId,
      'issue'
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
    console.error('Error issuing requisition:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาดภายในระบบ' }
    }, { status: 500 });
  }
}