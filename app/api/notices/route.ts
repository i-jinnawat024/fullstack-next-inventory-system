import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/database/mock-database';
import { verifyToken } from '@/lib/auth/jwt';
import { NoticeForm } from '@/lib/types';

// GET /api/notices - Get notices (active for users, all for admins)
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

    // Get query parameter
    const searchParams = request.nextUrl.searchParams;
    const showAll = searchParams.get('all') === 'true';

    // Fetch notices based on role
    let notices;
    if (payload.role === 'admin' && showAll) {
      notices = await mockDb.findAllNotices();
    } else {
      notices = await mockDb.findActiveNotices();
    }

    // Enrich with creator details
    const enrichedNotices = await Promise.all(
      notices.map(async (notice) => {
        const creator = await mockDb.findUserById(notice.createdBy);
        return {
          ...notice,
          createdByUser: creator ? {
            id: creator.id,
            name: creator.name
          } : null
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedNotices
    });
  } catch (error) {
    console.error('Error fetching notices:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาดภายในระบบ' } },
      { status: 500 }
    );
  }
}

// POST /api/notices - Create new notice (admin only)
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

    // Only admins can create notices
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'ไม่อนุญาตให้เข้าถึง' } },
        { status: 403 }
      );
    }

    // Parse request body
    const body: NoticeForm = await request.json();

    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'กรุณากรอกข้อมูลให้ครบถ้วน' } },
        { status: 400 }
      );
    }

    // Create notice
    const notice = await mockDb.createNotice({
      title: body.title,
      content: body.content,
      isActive: body.isActive ?? true,
      createdBy: payload.userId
    });

    return NextResponse.json({
      success: true,
      data: notice
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating notice:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาดภายในระบบ' } },
      { status: 500 }
    );
  }
}
