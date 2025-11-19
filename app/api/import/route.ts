import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/database/mock-database';
import { ImportData, ImportResult, ApiResponse } from '@/lib/types';
import { verifyAuth } from '@/lib/auth/jwt';

// POST /api/import - Import inventory data from CSV/Excel
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { data } = body as { data: ImportData[] };

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_DATA',
            message: 'ข้อมูลไม่ถูกต้อง',
          },
        } as ApiResponse,
        { status: 400 }
      );
    }

    const result: ImportResult = {
      success: true,
      imported: 0,
      errors: [],
    };

    // Validate and import each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 1;

      // Validate required fields
      const validationErrors = validateImportRow(row, rowNumber);
      if (validationErrors.length > 0) {
        result.errors.push(...validationErrors);
        continue;
      }

      try {
        // Check if product code already exists
        const existingItems = await mockDb.findAllInventory();
        const codeExists = existingItems.some(
          item => item.code.toLowerCase() === row.code.toLowerCase()
        );

        if (codeExists) {
          result.errors.push({
            row: rowNumber,
            message: `รหัสสินค้า "${row.code}" มีอยู่ในระบบแล้ว`,
          });
          continue;
        }

        // Create inventory item
        await mockDb.createInventoryItem({
          code: row.code.trim(),
          name: row.name.trim(),
          description: row.description.trim(),
          category: row.category.trim(),
          unit: row.unit.trim(),
          currentStock: row.currentStock,
          minimumStock: row.minimumStock,
          isActive: true,
        });

        result.imported++;
      } catch (error) {
        result.errors.push({
          row: rowNumber,
          message: `เกิดข้อผิดพลาดในการนำเข้า: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }

    // Set overall success based on whether any items were imported
    result.success = result.imported > 0;

    return NextResponse.json(
      {
        success: true,
        data: result,
      } as ApiResponse<ImportResult>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Import error:', error);
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

// Validate import row data
function validateImportRow(row: ImportData, rowNumber: number): { row: number; message: string }[] {
  const errors: { row: number; message: string }[] = [];

  // Check required fields
  if (!row.code || row.code.trim() === '') {
    errors.push({
      row: rowNumber,
      message: 'รหัสสินค้าเป็นข้อมูลที่จำเป็น',
    });
  }

  if (!row.name || row.name.trim() === '') {
    errors.push({
      row: rowNumber,
      message: 'ชื่อสินค้าเป็นข้อมูลที่จำเป็น',
    });
  }

  if (!row.category || row.category.trim() === '') {
    errors.push({
      row: rowNumber,
      message: 'หมวดหมู่เป็นข้อมูลที่จำเป็น',
    });
  }

  if (!row.unit || row.unit.trim() === '') {
    errors.push({
      row: rowNumber,
      message: 'หน่วยเป็นข้อมูลที่จำเป็น',
    });
  }

  // Validate numeric fields
  if (typeof row.currentStock !== 'number' || row.currentStock < 0) {
    errors.push({
      row: rowNumber,
      message: 'สต็อกปัจจุบันต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0',
    });
  }

  if (typeof row.minimumStock !== 'number' || row.minimumStock < 0) {
    errors.push({
      row: rowNumber,
      message: 'สต็อกขั้นต่ำต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0',
    });
  }

  // Validate code format (alphanumeric and hyphens only)
  if (row.code && !/^[A-Za-z0-9-]+$/.test(row.code)) {
    errors.push({
      row: rowNumber,
      message: 'รหัสสินค้าต้องประกอบด้วยตัวอักษร ตัวเลข และเครื่องหมาย - เท่านั้น',
    });
  }

  return errors;
}
