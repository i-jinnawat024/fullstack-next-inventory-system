import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/database/mock-database';
import { verifyAuth } from '@/lib/auth/jwt';
import { ApiResponse } from '@/lib/types';

// GET /api/inventory/[id] - Get specific inventory item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const item = await mockDb.findInventoryById(id);
    
    if (!item) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Inventory item not found' } },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      data: item,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to fetch inventory item' 
        } 
      },
      { status: 500 }
    );
  }
}

// PATCH /api/inventory/[id] - Update inventory item (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    const updates = await request.json();

    // Check if item exists
    const existingItem = await mockDb.findInventoryById(id);
    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Inventory item not found' } },
        { status: 404 }
      );
    }

    // If updating code, check for duplicates
    if (updates.code && updates.code !== existingItem.code) {
      const allItems = await mockDb.findAllInventory();
      const codeExists = allItems.some(item => item.code === updates.code && item.id !== id);
      
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
    }

    const updatedItem = await mockDb.updateInventoryItem(id, updates);

    const response: ApiResponse = {
      success: true,
      data: updatedItem,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to update inventory item' 
        } 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/inventory/[id] - Soft delete inventory item (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    const success = await mockDb.deleteInventoryItem(id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Inventory item not found' } },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      data: { message: 'Inventory item deleted successfully' },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'Failed to delete inventory item' 
        } 
      },
      { status: 500 }
    );
  }
}