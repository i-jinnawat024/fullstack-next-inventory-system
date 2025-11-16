import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/database/mock-database';
import { verifyToken } from '@/lib/auth/jwt';
import { ApiResponse, CreateRequisitionForm } from '@/lib/types';

// GET /api/requisitions - List user's requisitions or all (admin)
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    
    // Admin can see all requisitions, users can only see their own
    const filter = payload.role === 'admin' 
      ? { status }
      : { userId: payload.userId, status };

    const requisitions = await mockDb.findAllRequisitions(filter);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: requisitions
    });

  } catch (error) {
    console.error('Error fetching requisitions:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาดภายในระบบ' }
    }, { status: 500 });
  }
}

// POST /api/requisitions - Create new requisition
export async function POST(request: NextRequest) {
  try {
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

    const body: CreateRequisitionForm = await request.json();

    // Validate request body
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
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

    // Create requisition
    const requisition = await mockDb.createRequisition({
      userId: payload.userId,
      status: 'pending',
      items: body.items,
      notes: body.notes || ''
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: requisition
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating requisition:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาดภายในระบบ' }
    }, { status: 500 });
  }
}