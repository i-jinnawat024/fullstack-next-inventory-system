import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/database/mock-database';
import { verifyAuth } from '@/lib/auth/jwt';
import { ApiResponse } from '@/lib/types';

// GET /api/inventory/categories - Get all inventory categories
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const categories = await mockDb.getInventoryCategories();

    const response: ApiResponse = {
      success: true,
      data: categories,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching inventory categories:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to fetch inventory categories' 
        } 
      },
      { status: 500 }
    );
  }
}