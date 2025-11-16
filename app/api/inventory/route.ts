import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/database/mock-database';
import { verifyAuth } from '@/lib/auth/jwt';
import { ApiResponse, CreateInventoryItemForm } from '@/lib/types';

// GET /api/inventory - List all inventory items with optional filtering
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const stockStatus = searchParams.get('stockStatus') || undefined;

    const filter = { search, category, stockStatus };
    const inventory = await mockDb.findAllInventory(filter);

    const response: ApiResponse = {
      success: true,
      data: inventory,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to fetch inventory items' 
        } 
      },
      { status: 500 }
    );
  }
}

// POST /api/inventory - Create new inventory item (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const authResult = await verifyAuth(request);
    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    if (authResult.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
        { status: 403 }
      );
    }

    const body: CreateInventoryItemForm = await request.json();

    // Validate required fields
    const requiredFields = ['code', 'name', 'description', 'category', 'unit', 'currentStock', 'minimumStock'];
    const missingFields = requiredFields.filter(field => !body[field as keyof CreateInventoryItemForm]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Missing required fields',
            details: { missingFields }
          } 
        },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingItems = await mockDb.findAllInventory();
    const codeExists = existingItems.some(item => item.code === body.code);
    
    if (codeExists) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'DUPLICATE_CODE', 
            message: 'Product code already exists' 
          } 
        },
        { status: 400 }
      );
    }

    const newItem = await mockDb.createInventoryItem({
      ...body,
      isActive: true,
    });

    const response: ApiResponse = {
      success: true,
      data: newItem,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to create inventory item' 
        } 
      },
      { status: 500 }
    );
  }
}