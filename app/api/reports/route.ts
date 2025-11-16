import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/database/mock-database';
import { ApiResponse, RequisitionReport } from '@/lib/types';
import { verifyAuth } from '@/lib/auth/jwt';

// GET /api/reports - Generate requisition reports with filters
export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const authResult = await verifyAuth(request);
    if (!authResult.valid || authResult.user?.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'ไม่มีสิทธิ์เข้าถึง',
          },
        } as ApiResponse,
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const productId = searchParams.get('productId') || undefined;
    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined;
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;

    // Fetch all requisitions
    let requisitions = await mockDb.findAllRequisitions();

    // Apply filters
    if (userId) {
      requisitions = requisitions.filter(req => req.userId === userId);
    }

    if (productId) {
      requisitions = requisitions.filter(req =>
        req.items.some(item => item.inventoryItemId === productId)
      );
    }

    if (dateFrom) {
      requisitions = requisitions.filter(req => req.createdAt >= dateFrom);
    }

    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      requisitions = requisitions.filter(req => req.createdAt <= endOfDay);
    }

    // Calculate statistics
    const totalRequisitions = requisitions.length;
    const approvedRequisitions = requisitions.filter(req => req.status === 'approved' || req.status === 'issued').length;
    const rejectedRequisitions = requisitions.filter(req => req.status === 'rejected').length;
    const pendingRequisitions = requisitions.filter(req => req.status === 'pending').length;

    // Calculate most requested items
    const itemCounts = new Map<string, number>();
    for (const req of requisitions) {
      if (req.status !== 'draft' && req.status !== 'rejected') {
        for (const item of req.items) {
          const currentCount = itemCounts.get(item.inventoryItemId) || 0;
          itemCounts.set(item.inventoryItemId, currentCount + item.quantity);
        }
      }
    }

    const inventory = await mockDb.findAllInventory();
    const mostRequestedItems = Array.from(itemCounts.entries())
      .map(([itemId, totalRequested]) => {
        const inventoryItem = inventory.find(inv => inv.id === itemId);
        return {
          itemId,
          itemName: inventoryItem?.name || 'Unknown',
          totalRequested,
        };
      })
      .sort((a, b) => b.totalRequested - a.totalRequested)
      .slice(0, 10);

    // Calculate user activity
    const userCounts = new Map<string, number>();
    for (const req of requisitions) {
      if (req.status !== 'draft') {
        const currentCount = userCounts.get(req.userId) || 0;
        userCounts.set(req.userId, currentCount + 1);
      }
    }

    const users = await mockDb.findAllUsers();
    const userActivity = Array.from(userCounts.entries())
      .map(([userId, totalRequisitions]) => {
        const user = users.find(u => u.id === userId);
        return {
          userId,
          userName: user?.name || 'Unknown',
          totalRequisitions,
        };
      })
      .sort((a, b) => b.totalRequisitions - a.totalRequisitions);

    const report: RequisitionReport = {
      totalRequisitions,
      approvedRequisitions,
      rejectedRequisitions,
      pendingRequisitions,
      mostRequestedItems,
      userActivity,
    };

    return NextResponse.json(
      {
        success: true,
        data: report,
      } as ApiResponse<RequisitionReport>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'เกิดข้อผิดพลาดภายในระบบ',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      } as ApiResponse,
      { status: 500 }
    );
  }
}
