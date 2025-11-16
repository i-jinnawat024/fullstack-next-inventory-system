import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/database/mock-database';
import { verifyToken } from '@/lib/auth/jwt';
import { ApiResponse } from '@/lib/types';

// POST /api/requisitions/[id]/approve - Approve requisition (admin only)
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

    // Only admins can approve requisitions
    if (payload.role !== 'admin') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'FORBIDDEN', message: 'ไม่มีสิทธิ์อนุมัติคำขอ' }
      }, { status: 403 });
    }

    const requisition = await mockDb.findRequisitionById(id);
    if (!requisition) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'NOT_FOUND', message: 'ไม่พบคำขอเบิกสินค้า' }
      }, { status: 404 });
    }

    // Can only approve pending requisitions
    if (requisition.status !== 'pending') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'สามารถอนุมัติได้เฉพาะคำขอที่อยู่ในสถานะรอการอนุมัติ' }
      }, { status: 400 });
    }

    // Validate stock availability before approval
    const stockValidation = await mockDb.validateStockAvailability(requisition.items);
    if (!stockValidation.valid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { 
          code: 'INSUFFICIENT_STOCK', 
          message: 'สต็อกไม่เพียงพอสำหรับการอนุมัติ',
          details: stockValidation.errors
        }
      }, { status: 400 });
    }

    // Reduce stock quantities
    const stockReduced = await mockDb.reduceStock(requisition.items);
    if (!stockReduced) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'STOCK_REDUCTION_FAILED', message: 'ไม่สามารถลดสต็อกได้' }
      }, { status: 500 });
    }

    // Update requisition status to approved with audit trail
    const updatedRequisition = await mockDb.updateRequisitionWithAudit(
      id, 
      {
        status: 'approved',
        approvedBy: payload.userId,
        approvedAt: new Date()
      },
      payload.userId,
      'approve'
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
    console.error('Error approving requisition:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาดภายในระบบ' }
    }, { status: 500 });
  }
}