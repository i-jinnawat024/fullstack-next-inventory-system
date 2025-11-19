import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/database/mock-database';
import { verifyToken } from '@/lib/auth/jwt';
import { StockAdjustmentForm } from '@/lib/types';

// GET /api/stock-adjustments - Get stock adjustment history
export async function GET(request: NextRequest) {
  try {
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

    // Only admins can view stock adjustments
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'ไม่อนุญาตให้เข้าถึง' } },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const inventoryItemId = searchParams.get('inventoryItemId') || undefined;
    const type = searchParams.get('type') as 'in' | 'out' | undefined;

    // Fetch stock adjustments
    const adjustments = await mockDb.findAllStockAdjustments({
      inventoryItemId,
      type
    });

    // Enrich with inventory item details
    const enrichedAdjustments = await Promise.all(
      adjustments.map(async (adjustment) => {
        const item = await mockDb.findInventoryById(adjustment.inventoryItemId);
        const user = await mockDb.findUserById(adjustment.adjustedBy);
        return {
          ...adjustment,
          inventoryItem: item ? {
            id: item.id,
            code: item.code,
            name: item.name,
            unit: item.unit
          } : null,
          adjustedByUser: user ? {
            id: user.id,
            name: user.name
          } : null
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedAdjustments
    });
  } catch (error) {
    console.error('Error fetching stock adjustments:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาดภายในระบบ' } },
      { status: 500 }
    );
  }
}

// POST /api/stock-adjustments - Create new stock adjustment
export async function POST(request: NextRequest) {
  try {
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

    // Only admins can create stock adjustments
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'ไม่อนุญาตให้เข้าถึง' } },
        { status: 403 }
      );
    }

    // Parse request body
    const body: StockAdjustmentForm = await request.json();

    // Validate required fields
    if (!body.inventoryItemId || !body.type || !body.quantity || !body.reason) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'กรุณากรอกข้อมูลให้ครบถ้วน' } },
        { status: 400 }
      );
    }

    // Validate quantity is positive
    if (body.quantity <= 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'จำนวนต้องมากกว่า 0' } },
        { status: 400 }
      );
    }

    // Create stock adjustment
    const adjustment = await mockDb.createStockAdjustment({
      inventoryItemId: body.inventoryItemId,
      type: body.type,
      quantity: body.quantity,
      reason: body.reason,
      adjustedBy: payload.userId
    });

    if (!adjustment) {
      return NextResponse.json(
        { success: false, error: { code: 'ADJUSTMENT_FAILED', message: 'ไม่สามารถปรับปรุงสต็อกได้ (สินค้าไม่พบหรือสต็อกไม่เพียงพอ)' } },
        { status: 400 }
      );
    }

    // Get updated inventory item
    const updatedItem = await mockDb.findInventoryById(body.inventoryItemId);

    return NextResponse.json({
      success: true,
      data: {
        adjustment,
        updatedStock: updatedItem?.currentStock
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating stock adjustment:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาดภายในระบบ' } },
      { status: 500 }
    );
  }
}
