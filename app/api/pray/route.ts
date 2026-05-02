/**
 * POST /api/pray - Prayer Submission API Route
 * 
 * This route handles the complete prayer submission flow:
 * 1. Validates user authentication
 * 2. Validates request body (wish and offering)
 * 3. Validates image file size and format
 * 4. Uploads image to Supabase Storage
 * 5. Calls Gemini AI evaluator
 * 6. Saves prayer record to database
 * 7. Returns evaluation result
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 3.3, 3.4, 3.5, 
 *               4.1, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 13.1, 13.2, 
 *               13.3, 13.4, 13.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { evaluatePrayer } from '@/lib/gemini/evaluator';
import { ApiResponse, EvaluationResult } from '@/lib/types';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed image formats
const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * POST handler for prayer submission
 * 
 * @param request - Next.js request object containing FormData with wish and offering
 * @returns JSON response with evaluation result or error message
 */
export async function POST(request: NextRequest) {
  try {
    // Step 1: Validate user authentication (Requirement 11.2)
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'กรุณาเข้าสู่ระบบก่อนขอพร', // "Please log in before praying"
        },
        { status: 401 }
      );
    }

    // Step 2: Parse FormData and validate request body (Requirement 11.3)
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'ข้อมูลไม่ถูกต้อง', // "Invalid data"
        },
        { status: 400 }
      );
    }

    const wish = formData.get('wish') as string | null;
    const offering = formData.get('offering') as File | null;

    // Validate wish and offering are present
    if (!wish || !offering) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'กรุณากรอกคำขอพรและเลือกของเซ่นไหว้', // "Please enter wish and select offering"
        },
        { status: 400 }
      );
    }

    // Validate wish is not empty string
    if (wish.trim().length === 0) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'กรุณากรอกคำขอพร', // "Please enter wish"
        },
        { status: 400 }
      );
    }

    // Step 3: Validate image file size and format (Requirements 3.1, 3.2)
    if (offering.size > MAX_FILE_SIZE) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'ไฟล์ใหญ่เกินไป (สูงสุด 10MB)', // "File too large (max 10MB)"
        },
        { status: 413 }
      );
    }

    if (!ALLOWED_FORMATS.includes(offering.type)) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'รองรับเฉพาะไฟล์ JPEG, PNG, WebP', // "Only JPEG, PNG, WebP supported"
        },
        { status: 400 }
      );
    }

    // Step 4: Upload image to Supabase Storage (Requirements 3.3, 3.4, 11.4)
    // Generate unique identifier for the image
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = offering.name.split('.').pop() || 'jpg';
    const fileName = `${user.id}/${timestamp}-${randomString}.${fileExtension}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await offering.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('offerings')
      .upload(fileName, buffer, {
        contentType: offering.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('[Prayer API Error] Image upload failed:', {
        userId: user.id,
        error: uploadError.message,
        timestamp: new Date().toISOString(),
        fileMetadata: {
          fileName: offering.name,
          fileSize: offering.size,
          fileType: offering.type,
        },
      });

      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'ไม่สามารถอัพโหลดรูปภาพได้ กรุณาลองใหม่อีกครั้ง', // "Cannot upload image, please try again"
        },
        { status: 500 }
      );
    }

    // Step 5: Get public URL for uploaded image (Requirement 3.5)
    const { data: { publicUrl } } = supabase.storage
      .from('offerings')
      .getPublicUrl(fileName);

    // Step 6: Call Gemini evaluator with wish and image (Requirements 4.1, 11.5)
    // Convert image to base64 for Gemini API
    const base64Image = buffer.toString('base64');

    let evaluationResult: EvaluationResult;
    try {
      evaluationResult = await evaluatePrayer(wish, base64Image);
    } catch (error) {
      console.error('[Prayer API Error] AI evaluation failed:', {
        userId: user.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        requestDetails: {
          wishText: wish.substring(0, 100), // Truncate to first 100 chars
          wishLength: wish.length,
        },
      });

      // Check if it's a timeout error (Requirement 13.1)
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
        return NextResponse.json<ApiResponse<never>>(
          {
            success: false,
            error: 'เทพเจ้าไม่ตอบสนอง กรุณาลองใหม่ภายหลัง', // "Deity not responding, please try again later"
          },
          { status: 504 }
        );
      }

      // Generic AI error (Requirement 13.3)
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'ไม่สามารถประเมินคำขอพรได้ กรุณาลองใหม่อีกครั้ง', // "Cannot evaluate prayer, please try again"
        },
        { status: 500 }
      );
    }

    // Step 7: Insert prayer record into database (Requirements 7.1-7.8, 11.6)
    const { data: prayerData, error: dbError } = await supabase
      .from('prayers')
      .insert({
        user_id: user.id,
        wish_text: wish,
        offering_image_url: publicUrl,
        tier: evaluationResult.tier,
        verdict: evaluationResult.verdict,
        comment: evaluationResult.comment,
        // created_at is automatically set by database
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Prayer API Error] Database insert failed:', {
        userId: user.id,
        error: dbError.message,
        timestamp: new Date().toISOString(),
        operation: 'INSERT',
        table: 'prayers',
      });

      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'ไม่สามารถบันทึกคำขอพรได้ กรุณาลองใหม่อีกครั้ง', // "Cannot save prayer, please try again"
        },
        { status: 500 }
      );
    }

    // Step 8: Return evaluation result with HTTP 200 (Requirement 11.7)
    return NextResponse.json<ApiResponse<EvaluationResult & { prayerId: string }>>(
      {
        success: true,
        data: {
          tier: evaluationResult.tier,
          verdict: evaluationResult.verdict,
          comment: evaluationResult.comment,
          prayerId: prayerData.id,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    // Catch-all error handler (Requirement 13.3)
    console.error('[Prayer API Error] Unexpected error:', {
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
