/**
 * GET /api/history - Prayer History Retrieval API Route
 * 
 * This route retrieves the authenticated user's prayer history:
 * 1. Validates user authentication
 * 2. Parses query parameters (limit, offset)
 * 3. Queries prayers table filtered by user_id
 * 4. Orders results by created_at DESC
 * 5. Returns prayer records
 * 
 * Requirements: 8.1, 8.2, 13.3
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApiResponse, Prayer } from '@/lib/types';

// Default pagination values
const DEFAULT_LIMIT = 50;
const DEFAULT_OFFSET = 0;

/**
 * GET handler for prayer history retrieval
 * 
 * @param request - Next.js request object with optional query parameters (limit, offset)
 * @returns JSON response with array of prayer records or error message
 */
export async function GET(request: NextRequest) {
  try {
    // Step 1: Validate user authentication (Requirement 8.1)
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'กรุณาเข้าสู่ระบบก่อนดูประวัติ', // "Please log in before viewing history"
        },
        { status: 401 }
      );
    }

    // Step 2: Parse query parameters for pagination
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    // Validate and parse limit parameter
    let limit = DEFAULT_LIMIT;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = parsedLimit;
      }
    }

    // Validate and parse offset parameter
    let offset = DEFAULT_OFFSET;
    if (offsetParam) {
      const parsedOffset = parseInt(offsetParam, 10);
      if (!isNaN(parsedOffset) && parsedOffset >= 0) {
        offset = parsedOffset;
      }
    }

    // Step 3: Query prayers table filtered by user_id, ordered by created_at DESC (Requirements 8.1, 8.2)
    const { data: prayers, error: dbError } = await supabase
      .from('prayers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (dbError) {
      console.error('[History API Error] Database query failed:', {
        userId: user.id,
        error: dbError.message,
        timestamp: new Date().toISOString(),
        operation: 'SELECT',
        table: 'prayers',
        queryParams: {
          limit,
          offset,
        },
      });

      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'ไม่สามารถโหลดประวัติได้ กรุณาลองใหม่อีกครั้ง', // "Cannot load history, please try again"
        },
        { status: 500 }
      );
    }

    // Step 4: Return prayer records with HTTP 200
    return NextResponse.json<ApiResponse<Prayer[]>>(
      {
        success: true,
        data: prayers || [],
      },
      { status: 200 }
    );

  } catch (error) {
    // Catch-all error handler (Requirement 13.3)
    console.error('[History API Error] Unexpected error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง', // "System error, please try again"
      },
      { status: 500 }
    );
  }
}
