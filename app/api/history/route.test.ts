/**
 * Unit tests for GET /api/history route
 * 
 * Tests cover:
 * - Authentication validation
 * - Query parameter parsing (limit, offset)
 * - Database query with user_id filter
 * - Ordering by created_at DESC
 * - Error handling with Thai messages
 * - Empty result handling
 * 
 * @jest-environment node
 */

import { GET } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Prayer } from '@/lib/types';

// Mock dependencies
jest.mock('@/lib/supabase/server');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe('GET /api/history', () => {
  let mockSupabase: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default Supabase mock
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(),
    };

    mockCreateClient.mockReturnValue(mockSupabase);
  });

  /**
   * Helper function to create a mock NextRequest with query parameters
   */
  function createMockRequest(queryParams: Record<string, string> = {}): NextRequest {
    const url = new URL('http://localhost:3000/api/history');
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    return {
      url: url.toString(),
    } as NextRequest;
  }

  /**
   * Helper function to create a mock Prayer object
   */
  function createMockPrayer(overrides: Partial<Prayer> = {}): Prayer {
    return {
      id: 'prayer-123',
      user_id: 'user-123',
      wish_text: 'ขอให้รวย',
      offering_image_url: 'https://example.com/offering.jpg',
      tier: 'SSR',
      verdict: 'ดีมาก',
      comment: 'สุดยอด',
      created_at: '2024-01-01T00:00:00Z',
      ...overrides,
    };
  }

  describe('Authentication validation', () => {
    it('should return 401 when user is not authenticated', async () => {
      // Mock unauthenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      const request = createMockRequest();
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toBe('กรุณาเข้าสู่ระบบก่อนดูประวัติ');
    });

    it('should return 401 when auth error occurs', async () => {
      // Mock auth error
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Session expired'),
      });

      const request = createMockRequest();
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.error).toBe('กรุณาเข้าสู่ระบบก่อนดูประวัติ');
    });

    it('should return 401 when user object is null', async () => {
      // Mock null user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = createMockRequest();
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.success).toBe(false);
    });
  });

  describe('Query parameter parsing', () => {
    beforeEach(() => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      // Mock successful database query
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            range: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });
    });

    it('should use default limit (50) when not provided', async () => {
      const request = createMockRequest();
      await GET(request);

      const mockFrom = mockSupabase.from.mock.results[0].value;
      const mockSelect = mockFrom.select.mock.results[0].value;
      const mockEq = mockSelect.eq.mock.results[0].value;
      const mockOrder = mockEq.order.mock.results[0].value;
      const rangeCall = mockOrder.range.mock.calls[0];

      expect(rangeCall).toEqual([0, 49]); // offset 0, limit 50 -> range(0, 49)
    });

    it('should use default offset (0) when not provided', async () => {
      const request = createMockRequest({ limit: '10' });
      await GET(request);

      const mockFrom = mockSupabase.from.mock.results[0].value;
      const mockSelect = mockFrom.select.mock.results[0].value;
      const mockEq = mockSelect.eq.mock.results[0].value;
      const mockOrder = mockEq.order.mock.results[0].value;
      const rangeCall = mockOrder.range.mock.calls[0];

      expect(rangeCall).toEqual([0, 9]); // offset 0, limit 10 -> range(0, 9)
    });

    it('should parse and use custom limit parameter', async () => {
      const request = createMockRequest({ limit: '20' });
      await GET(request);

      const mockFrom = mockSupabase.from.mock.results[0].value;
      const mockSelect = mockFrom.select.mock.results[0].value;
      const mockEq = mockSelect.eq.mock.results[0].value;
      const mockOrder = mockEq.order.mock.results[0].value;
      const rangeCall = mockOrder.range.mock.calls[0];

      expect(rangeCall).toEqual([0, 19]); // offset 0, limit 20 -> range(0, 19)
    });

    it('should parse and use custom offset parameter', async () => {
      const request = createMockRequest({ offset: '10' });
      await GET(request);

      const mockFrom = mockSupabase.from.mock.results[0].value;
      const mockSelect = mockFrom.select.mock.results[0].value;
      const mockEq = mockSelect.eq.mock.results[0].value;
      const mockOrder = mockEq.order.mock.results[0].value;
      const rangeCall = mockOrder.range.mock.calls[0];

      expect(rangeCall).toEqual([10, 59]); // offset 10, limit 50 -> range(10, 59)
    });

    it('should parse and use both limit and offset parameters', async () => {
      const request = createMockRequest({ limit: '25', offset: '50' });
      await GET(request);

      const mockFrom = mockSupabase.from.mock.results[0].value;
      const mockSelect = mockFrom.select.mock.results[0].value;
      const mockEq = mockSelect.eq.mock.results[0].value;
      const mockOrder = mockEq.order.mock.results[0].value;
      const rangeCall = mockOrder.range.mock.calls[0];

      expect(rangeCall).toEqual([50, 74]); // offset 50, limit 25 -> range(50, 74)
    });

    it('should ignore invalid limit parameter and use default', async () => {
      const request = createMockRequest({ limit: 'invalid' });
      await GET(request);

      const mockFrom = mockSupabase.from.mock.results[0].value;
      const mockSelect = mockFrom.select.mock.results[0].value;
      const mockEq = mockSelect.eq.mock.results[0].value;
      const mockOrder = mockEq.order.mock.results[0].value;
      const rangeCall = mockOrder.range.mock.calls[0];

      expect(rangeCall).toEqual([0, 49]); // Uses default limit 50
    });

    it('should ignore invalid offset parameter and use default', async () => {
      const request = createMockRequest({ offset: 'invalid' });
      await GET(request);

      const mockFrom = mockSupabase.from.mock.results[0].value;
      const mockSelect = mockFrom.select.mock.results[0].value;
      const mockEq = mockSelect.eq.mock.results[0].value;
      const mockOrder = mockEq.order.mock.results[0].value;
      const rangeCall = mockOrder.range.mock.calls[0];

      expect(rangeCall).toEqual([0, 49]); // Uses default offset 0
    });

    it('should ignore negative limit and use default', async () => {
      const request = createMockRequest({ limit: '-10' });
      await GET(request);

      const mockFrom = mockSupabase.from.mock.results[0].value;
      const mockSelect = mockFrom.select.mock.results[0].value;
      const mockEq = mockSelect.eq.mock.results[0].value;
      const mockOrder = mockEq.order.mock.results[0].value;
      const rangeCall = mockOrder.range.mock.calls[0];

      expect(rangeCall).toEqual([0, 49]); // Uses default limit 50
    });

    it('should ignore negative offset and use default', async () => {
      const request = createMockRequest({ offset: '-5' });
      await GET(request);

      const mockFrom = mockSupabase.from.mock.results[0].value;
      const mockSelect = mockFrom.select.mock.results[0].value;
      const mockEq = mockSelect.eq.mock.results[0].value;
      const mockOrder = mockEq.order.mock.results[0].value;
      const rangeCall = mockOrder.range.mock.calls[0];

      expect(rangeCall).toEqual([0, 49]); // Uses default offset 0
    });
  });

  describe('Database query', () => {
    beforeEach(() => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });
    });

    it('should query prayers table with user_id filter', async () => {
      const mockEq = jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          range: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const request = createMockRequest();
      await GET(request);

      expect(mockSupabase.from).toHaveBeenCalledWith('prayers');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('should order results by created_at DESC', async () => {
      const mockOrder = jest.fn().mockReturnValue({
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      const mockEq = jest.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const request = createMockRequest();
      await GET(request);

      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should return 500 when database query fails', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: null,
                error: new Error('Database error'),
              }),
            }),
          }),
        }),
      });

      const request = createMockRequest();
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBe('ไม่สามารถโหลดประวัติได้ กรุณาลองใหม่อีกครั้ง');
    });
  });

  describe('Successful history retrieval', () => {
    beforeEach(() => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });
    });

    it('should return 200 with empty array when no prayers exist', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      });

      const request = createMockRequest();
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toEqual([]);
    });

    it('should return 200 with prayer records on success', async () => {
      const mockPrayers = [
        createMockPrayer({ id: 'prayer-1', created_at: '2024-01-03T00:00:00Z' }),
        createMockPrayer({ id: 'prayer-2', created_at: '2024-01-02T00:00:00Z' }),
        createMockPrayer({ id: 'prayer-3', created_at: '2024-01-01T00:00:00Z' }),
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: mockPrayers,
                error: null,
              }),
            }),
          }),
        }),
      });

      const request = createMockRequest();
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toEqual(mockPrayers);
      expect(json.data).toHaveLength(3);
    });

    it('should return prayers with all required fields', async () => {
      const mockPrayer = createMockPrayer({
        id: 'prayer-123',
        user_id: 'user-123',
        wish_text: 'ขอให้รวยๆ',
        offering_image_url: 'https://example.com/offering.jpg',
        tier: 'SSR',
        verdict: 'ดีมาก',
        comment: 'สุดยอดมาก',
        created_at: '2024-01-01T12:00:00Z',
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: [mockPrayer],
                error: null,
              }),
            }),
          }),
        }),
      });

      const request = createMockRequest();
      const response = await GET(request);
      const json = await response.json();

      expect(json.data[0]).toMatchObject({
        id: 'prayer-123',
        user_id: 'user-123',
        wish_text: 'ขอให้รวยๆ',
        offering_image_url: 'https://example.com/offering.jpg',
        tier: 'SSR',
        verdict: 'ดีมาก',
        comment: 'สุดยอดมาก',
        created_at: '2024-01-01T12:00:00Z',
      });
    });

    it('should handle all tier types correctly', async () => {
      const mockPrayers = [
        createMockPrayer({ id: 'prayer-1', tier: 'SSR' }),
        createMockPrayer({ id: 'prayer-2', tier: 'SR' }),
        createMockPrayer({ id: 'prayer-3', tier: 'R' }),
        createMockPrayer({ id: 'prayer-4', tier: 'เกลือ' }),
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: mockPrayers,
                error: null,
              }),
            }),
          }),
        }),
      });

      const request = createMockRequest();
      const response = await GET(request);
      const json = await response.json();

      expect(json.data[0].tier).toBe('SSR');
      expect(json.data[1].tier).toBe('SR');
      expect(json.data[2].tier).toBe('R');
      expect(json.data[3].tier).toBe('เกลือ');
    });

    it('should return empty array when data is null', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      });

      const request = createMockRequest();
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toEqual([]);
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });
    });

    it('should return 500 with Thai error message on unexpected error', async () => {
      // Mock unexpected error
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = createMockRequest();
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBe('เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง');
    });

    it('should log error details on database failure', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: null,
                error: new Error('Connection timeout'),
              }),
            }),
          }),
        }),
      });

      const request = createMockRequest();
      await GET(request);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[History API Error] Database query failed:',
        expect.objectContaining({
          userId: 'user-123',
          error: 'Connection timeout',
        })
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log error details on unexpected error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      mockSupabase.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = createMockRequest();
      await GET(request);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[History API Error] Unexpected error:',
        expect.objectContaining({
          error: 'Unexpected error',
        })
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
