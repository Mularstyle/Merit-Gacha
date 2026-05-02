/**
 * Unit tests for POST /api/pray route
 * 
 * Tests cover:
 * - Authentication validation
 * - Request body validation
 * - Image file validation (size and format)
 * - Image upload to Supabase Storage
 * - AI evaluation integration
 * - Database persistence
 * - Error handling with Thai messages
 * 
 * @jest-environment node
 */

import { POST } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { evaluatePrayer } from '@/lib/gemini/evaluator';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/gemini/evaluator');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockEvaluatePrayer = evaluatePrayer as jest.MockedFunction<typeof evaluatePrayer>;

describe('POST /api/pray', () => {
  let mockSupabase: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default Supabase mock
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      storage: {
        from: jest.fn(),
      },
      from: jest.fn(),
    };

    mockCreateClient.mockReturnValue(mockSupabase);
  });

  /**
   * Helper function to create a mock FormData with wish and offering
   */
  function createMockFormData(wish: string | null, offering: File | null): FormData {
    const formData = new FormData();
    if (wish !== null) {
      formData.append('wish', wish);
    }
    if (offering !== null) {
      formData.append('offering', offering);
    }
    return formData;
  }

  /**
   * Helper function to create a mock File object
   */
  function createMockFile(
    name: string,
    type: string,
    size: number
  ): File {
    const buffer = Buffer.alloc(size);
    return new File([buffer], name, { type });
  }

  /**
   * Helper function to create a mock NextRequest
   */
  function createMockRequest(formData: FormData): NextRequest {
    return {
      formData: jest.fn().mockResolvedValue(formData),
    } as unknown as NextRequest;
  }

  describe('Authentication validation', () => {
    it('should return 401 when user is not authenticated', async () => {
      // Mock unauthenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      const formData = createMockFormData('ขอให้รวย', createMockFile('offering.jpg', 'image/jpeg', 1024));
      const request = createMockRequest(formData);

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toBe('กรุณาเข้าสู่ระบบก่อนขอพร');
    });

    it('should return 401 when auth error occurs', async () => {
      // Mock auth error
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Session expired'),
      });

      const formData = createMockFormData('ขอให้รวย', createMockFile('offering.jpg', 'image/jpeg', 1024));
      const request = createMockRequest(formData);

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.success).toBe(false);
    });
  });

  describe('Request body validation', () => {
    beforeEach(() => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });
    });

    it('should return 400 when wish is missing', async () => {
      const formData = createMockFormData(null, createMockFile('offering.jpg', 'image/jpeg', 1024));
      const request = createMockRequest(formData);

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('กรุณากรอกคำขอพรและเลือกของเซ่นไหว้');
    });

    it('should return 400 when offering is missing', async () => {
      const formData = createMockFormData('ขอให้รวย', null);
      const request = createMockRequest(formData);

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('กรุณากรอกคำขอพรและเลือกของเซ่นไหว้');
    });

    it('should return 400 when wish is empty string', async () => {
      const formData = createMockFormData('   ', createMockFile('offering.jpg', 'image/jpeg', 1024));
      const request = createMockRequest(formData);

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('กรุณากรอกคำขอพร');
    });

    it('should return 400 when FormData parsing fails', async () => {
      const request = {
        formData: jest.fn().mockRejectedValue(new Error('Invalid FormData')),
      } as unknown as NextRequest;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('ข้อมูลไม่ถูกต้อง');
    });
  });

  describe('Image file validation', () => {
    beforeEach(() => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });
    });

    it('should return 413 when file size exceeds 10MB', async () => {
      const largeFile = createMockFile('large.jpg', 'image/jpeg', 11 * 1024 * 1024); // 11MB
      const formData = createMockFormData('ขอให้รวย', largeFile);
      const request = createMockRequest(formData);

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(413);
      expect(json.success).toBe(false);
      expect(json.error).toBe('ไฟล์ใหญ่เกินไป (สูงสุด 10MB)');
    });

    it('should return 400 when file format is not allowed', async () => {
      const invalidFile = createMockFile('doc.pdf', 'application/pdf', 1024);
      const formData = createMockFormData('ขอให้รวย', invalidFile);
      const request = createMockRequest(formData);

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toBe('รองรับเฉพาะไฟล์ JPEG, PNG, WebP');
    });

    it('should accept JPEG format', async () => {
      const jpegFile = createMockFile('offering.jpg', 'image/jpeg', 1024);
      const formData = createMockFormData('ขอให้รวย', jpegFile);
      const request = createMockRequest(formData);

      // Mock successful upload and evaluation
      mockSupabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: { path: 'user-123/test.jpg' }, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } }),
      });

      mockEvaluatePrayer.mockResolvedValue({
        tier: 'SSR',
        verdict: 'ดีมาก',
        comment: 'ของเซ่นสวยงาม',
      });

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'prayer-123' },
              error: null,
            }),
          }),
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should accept PNG format', async () => {
      const pngFile = createMockFile('offering.png', 'image/png', 1024);
      const formData = createMockFormData('ขอให้รวย', pngFile);
      const request = createMockRequest(formData);

      // Mock successful flow
      mockSupabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: { path: 'user-123/test.png' }, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/test.png' } }),
      });

      mockEvaluatePrayer.mockResolvedValue({
        tier: 'SR',
        verdict: 'ดี',
        comment: 'พอใช้ได้',
      });

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'prayer-123' },
              error: null,
            }),
          }),
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should accept WebP format', async () => {
      const webpFile = createMockFile('offering.webp', 'image/webp', 1024);
      const formData = createMockFormData('ขอให้รวย', webpFile);
      const request = createMockRequest(formData);

      // Mock successful flow
      mockSupabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: { path: 'user-123/test.webp' }, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/test.webp' } }),
      });

      mockEvaluatePrayer.mockResolvedValue({
        tier: 'R',
        verdict: 'ธรรมดา',
        comment: 'ก็ได้',
      });

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'prayer-123' },
              error: null,
            }),
          }),
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe('Image upload to Supabase Storage', () => {
    beforeEach(() => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });
    });

    it('should return 500 when image upload fails', async () => {
      const file = createMockFile('offering.jpg', 'image/jpeg', 1024);
      const formData = createMockFormData('ขอให้รวย', file);
      const request = createMockRequest(formData);

      // Mock upload failure
      mockSupabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Storage error'),
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBe('ไม่สามารถอัพโหลดรูปภาพได้ กรุณาลองใหม่อีกครั้ง');
    });

    it('should generate unique file names for uploads', async () => {
      const file = createMockFile('offering.jpg', 'image/jpeg', 1024);
      const formData = createMockFormData('ขอให้รวย', file);
      const request = createMockRequest(formData);

      const mockUpload = jest.fn().mockResolvedValue({
        data: { path: 'user-123/12345-abc.jpg' },
        error: null,
      });

      mockSupabase.storage.from.mockReturnValue({
        upload: mockUpload,
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/12345-abc.jpg' },
        }),
      });

      mockEvaluatePrayer.mockResolvedValue({
        tier: 'SSR',
        verdict: 'ดีมาก',
        comment: 'สุดยอด',
      });

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'prayer-123' },
              error: null,
            }),
          }),
        }),
      });

      await POST(request);

      // Verify upload was called with a file name containing user ID
      expect(mockUpload).toHaveBeenCalled();
      const uploadCall = mockUpload.mock.calls[0];
      const fileName = uploadCall[0] as string;
      expect(fileName).toContain('user-123/');
      expect(fileName).toMatch(/\.jpg$/);
    });
  });

  describe('AI evaluation integration', () => {
    beforeEach(() => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      // Mock successful upload
      mockSupabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: { path: 'user-123/test.jpg' },
          error: null,
        }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/test.jpg' },
        }),
      });
    });

    it('should return 500 when AI evaluation fails', async () => {
      const file = createMockFile('offering.jpg', 'image/jpeg', 1024);
      const formData = createMockFormData('ขอให้รวย', file);
      const request = createMockRequest(formData);

      // Mock AI evaluation failure
      mockEvaluatePrayer.mockRejectedValue(new Error('AI API error'));

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBe('ไม่สามารถประเมินคำขอพรได้ กรุณาลองใหม่อีกครั้ง');
    });

    it('should return 504 when AI evaluation times out', async () => {
      const file = createMockFile('offering.jpg', 'image/jpeg', 1024);
      const formData = createMockFormData('ขอให้รวย', file);
      const request = createMockRequest(formData);

      // Mock timeout error
      mockEvaluatePrayer.mockRejectedValue(new Error('Request timeout'));

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(504);
      expect(json.success).toBe(false);
      expect(json.error).toBe('เทพเจ้าไม่ตอบสนอง กรุณาลองใหม่ภายหลัง');
    });

    it('should call evaluatePrayer with wish and base64 image', async () => {
      const file = createMockFile('offering.jpg', 'image/jpeg', 1024);
      const formData = createMockFormData('ขอให้รวย', file);
      const request = createMockRequest(formData);

      mockEvaluatePrayer.mockResolvedValue({
        tier: 'SSR',
        verdict: 'ดีมาก',
        comment: 'สุดยอด',
      });

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'prayer-123' },
              error: null,
            }),
          }),
        }),
      });

      await POST(request);

      expect(mockEvaluatePrayer).toHaveBeenCalledWith(
        'ขอให้รวย',
        expect.any(String) // base64 string
      );
    });
  });

  describe('Database persistence', () => {
    beforeEach(() => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      // Mock successful upload
      mockSupabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: { path: 'user-123/test.jpg' },
          error: null,
        }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/test.jpg' },
        }),
      });

      // Mock successful AI evaluation
      mockEvaluatePrayer.mockResolvedValue({
        tier: 'SSR',
        verdict: 'ดีมาก',
        comment: 'สุดยอด',
      });
    });

    it('should return 500 when database insert fails', async () => {
      const file = createMockFile('offering.jpg', 'image/jpeg', 1024);
      const formData = createMockFormData('ขอให้รวย', file);
      const request = createMockRequest(formData);

      // Mock database error
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error'),
            }),
          }),
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBe('ไม่สามารถบันทึกคำขอพรได้ กรุณาลองใหม่อีกครั้ง');
    });

    it('should insert prayer record with correct data', async () => {
      const file = createMockFile('offering.jpg', 'image/jpeg', 1024);
      const formData = createMockFormData('ขอให้รวยๆ', file);
      const request = createMockRequest(formData);

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'prayer-123' },
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      await POST(request);

      expect(mockSupabase.from).toHaveBeenCalledWith('prayers');
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        wish_text: 'ขอให้รวยๆ',
        offering_image_url: 'https://example.com/test.jpg',
        tier: 'SSR',
        verdict: 'ดีมาก',
        comment: 'สุดยอด',
      });
    });
  });

  describe('Successful prayer submission', () => {
    beforeEach(() => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      // Mock successful upload
      mockSupabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: { path: 'user-123/test.jpg' },
          error: null,
        }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/test.jpg' },
        }),
      });

      // Mock successful AI evaluation
      mockEvaluatePrayer.mockResolvedValue({
        tier: 'SSR',
        verdict: 'ดีมาก',
        comment: 'สุดยอด',
      });

      // Mock successful database insert
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'prayer-123' },
              error: null,
            }),
          }),
        }),
      });
    });

    it('should return 200 with evaluation result on success', async () => {
      const file = createMockFile('offering.jpg', 'image/jpeg', 1024);
      const formData = createMockFormData('ขอให้รวย', file);
      const request = createMockRequest(formData);

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toEqual({
        tier: 'SSR',
        verdict: 'ดีมาก',
        comment: 'สุดยอด',
        prayerId: 'prayer-123',
      });
    });

    it('should handle all tier types correctly', async () => {
      const tiers: Array<'SSR' | 'SR' | 'R' | 'เกลือ'> = ['SSR', 'SR', 'R', 'เกลือ'];

      for (const tier of tiers) {
        mockEvaluatePrayer.mockResolvedValue({
          tier,
          verdict: 'test verdict',
          comment: 'test comment',
        });

        const file = createMockFile('offering.jpg', 'image/jpeg', 1024);
        const formData = createMockFormData('ขอให้รวย', file);
        const request = createMockRequest(formData);

        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.data.tier).toBe(tier);
      }
    });
  });
});
