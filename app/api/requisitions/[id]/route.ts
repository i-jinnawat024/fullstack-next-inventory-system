import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/database/mock-database';
import { verifyToken } from '@/lib/auth/jwt';
import { ApiResponse, CreateRequisitionForm } from '@/lib/types';

// GET /api/requisitions/[id] - Get specific requisition
export async function GET(
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

    const requisition = await mockDb.findRequisitionById(id);
    if (!requisition) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'NOT_FOUND', message: 'ไม่พบคำขอเบิกสินค้า' }
      }, { status: 404 });
    }

    // Users can only see their own requisitions, admins can see all
    if (payload.role !== 'admin' && requisition.userId !== payload.userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'FORBIDDEN', message: 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้' }
      }, { status: 403 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: requisition
    });

  } catch (error) {
    console.error('Error fetching requisition:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาดภายในระบบ' }
    }, { status: 500 });
  }
}

// PATCH /api/requisitions/[id] - Update requisition (draft only)
export async function PATCH(
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

    const requisition = await mockDb.findRequisitionById(id);
    if (!requisition) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'NOT_FOUND', message: 'ไม่พบคำขอเบิกสินค้า' }
      }, { status: 404 });
    }

    // Users can only update their own draft requisitions
    if (requisition.userId !== payload.userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'FORBIDDEN', message: 'ไม่มีสิทธิ์แก้ไขคำขอนี้' }
      }, { status: 403 });
    }

    if (requisition.status !== 'draft') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'สามารถแก้ไขได้เฉพาะคำขอที่อยู่ในสถานะร่าง' }
      }, { status: 400 });
    }

    const body: Partial<CreateRequisitionForm> = await request.json();

    // Validate items if provided
    if (body.items) {
      if (!Array.isArray(body.items) || body.items.length === 0) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: { code: 'INVALID_DATA', message: 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการ' }
        }, { status: 400 });
      }

      // Validate each item
      for (const item of body.items) {
        if (!item.inventoryItemId || !item.quantity || item.quantity <= 0) {
          return NextResponse.json<ApiResponse>({
            success: false,
            error: { code: 'INVALID_DATA', message: 'ข้อมูลสินค้าไม่ถูกต้อง' }
          }, { status: 400 });
        }
      }

      // Validate stock availability
      const stockValidation = await mockDb.validateStockAvailability(body.items);
      if (!stockValidation.valid) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: { 
            code: 'INSUFFICIENT_STOCK', 
            message: 'สต็อกไม่เพียงพอ',
            details: stockValidation.errors
          }
        }, { status: 400 });
      }
    }

    // Update requisition
    const updatedRequisition = await mockDb.updateRequisition(id, {
      ...(body.items && { items: body.items }),
      ...(body.notes !== undefined && { notes: body.notes })
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedRequisition
    });

  } catch (error) {
    console.error('Error updating requisition:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาดภายในระบบ' }
    }, { status: 500 });
  }
}