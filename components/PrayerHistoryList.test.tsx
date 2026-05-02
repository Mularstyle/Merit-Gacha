import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PrayerHistoryList from './PrayerHistoryList';
import { createClient } from '@/lib/supabase/client';
import { Prayer } from '@/lib/types';

// Mock the Supabase client
jest.mock('@/lib/supabase/client');

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe('PrayerHistoryList', () => {
  const mockUserId = 'test-user-123';

  const mockPrayers: Prayer[] = [
    {
      id: '1',
      user_id: mockUserId,
      wish_text: 'ขอให้รวย',
      offering_image_url: 'https://example.com/image1.jpg',
      tier: 'SSR',
      verdict: 'อนุมัติ',
      comment: 'ของเซ่นดีมาก',
      created_at: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      user_id: mockUserId,
      wish_text: 'ขอให้สอบผ่าน',
      offering_image_url: 'https://example.com/image2.jpg',
      tier: 'R',
      verdict: 'พอใช้ได้',
      comment: 'ของเซ่นธรรมดา',
      created_at: '2024-01-14T09:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays loading state initially', () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnValue(new Promise(() => {})), // Never resolves
    };

    mockCreateClient.mockReturnValue(mockSupabase as any);

    render(<PrayerHistoryList userId={mockUserId} />);

    expect(screen.getByText('กำลังโหลดประวัติ...')).toBeInTheDocument();
  });

  it('displays prayers in reverse chronological order', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockPrayers,
        error: null,
      }),
    };

    mockCreateClient.mockReturnValue(mockSupabase as any);

    render(<PrayerHistoryList userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByText('ขอให้รวย')).toBeInTheDocument();
    });

    // Verify all prayer fields are displayed
    expect(screen.getByText('ขอให้รวย')).toBeInTheDocument();
    expect(screen.getByText('ขอให้สอบผ่าน')).toBeInTheDocument();
    expect(screen.getByText('อนุมัติ')).toBeInTheDocument();
    expect(screen.getByText('พอใช้ได้')).toBeInTheDocument();
    expect(screen.getByText('ของเซ่นดีมาก')).toBeInTheDocument();
    expect(screen.getByText('ของเซ่นธรรมดา')).toBeInTheDocument();

    // Verify tier badges are displayed
    expect(screen.getByText('SSR')).toBeInTheDocument();
    expect(screen.getByText('R')).toBeInTheDocument();

    // Verify order was called with descending
    expect(mockSupabase.order).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });
  });

  it('displays error state when fetch fails', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      }),
    };

    mockCreateClient.mockReturnValue(mockSupabase as any);

    render(<PrayerHistoryList userId={mockUserId} />);

    await waitFor(() => {
      expect(
        screen.getByText('ไม่สามารถโหลดประวัติได้ กรุณาลองใหม่อีกครั้ง')
      ).toBeInTheDocument();
    });

    // Verify retry button is displayed
    expect(screen.getByText('ลองอีกครั้ง')).toBeInTheDocument();
  });

  it('retries fetching prayers when retry button is clicked', async () => {
    // First call fails
    const mockSupabaseError = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      }),
    };

    mockCreateClient.mockReturnValueOnce(mockSupabaseError as any);

    render(<PrayerHistoryList userId={mockUserId} />);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('ลองอีกครั้ง')).toBeInTheDocument();
    });

    // Mock successful response for retry
    const mockSupabaseSuccess = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockPrayers,
        error: null,
      }),
    };

    mockCreateClient.mockReturnValueOnce(mockSupabaseSuccess as any);

    // Click retry button
    const retryButton = screen.getByText('ลองอีกครั้ง');
    fireEvent.click(retryButton);

    // Verify prayers are displayed after retry
    await waitFor(() => {
      expect(screen.getByText('ขอให้รวย')).toBeInTheDocument();
    });

    // Verify error message is cleared
    expect(screen.queryByText('ไม่สามารถโหลดประวัติได้ กรุณาลองใหม่อีกครั้ง')).not.toBeInTheDocument();
  });

  it('displays empty state when no prayers exist', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    mockCreateClient.mockReturnValue(mockSupabase as any);

    render(<PrayerHistoryList userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByText('ยังไม่มีประวัติคำขอพร')).toBeInTheDocument();
    });

    expect(
      screen.getByText('ไปที่ศาลเจ้าเพื่อส่งคำขอพรครั้งแรกของคุณ')
    ).toBeInTheDocument();
  });

  it('displays all required prayer fields', async () => {
    const singlePrayer: Prayer[] = [
      {
        id: '1',
        user_id: mockUserId,
        wish_text: 'ขอให้มีความสุข',
        offering_image_url: 'https://example.com/image.jpg',
        tier: 'SR',
        verdict: 'ดีพอสมควร',
        comment: 'ของเซ่นไม่เลว',
        created_at: '2024-01-15T10:30:00Z',
      },
    ];

    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: singlePrayer,
        error: null,
      }),
    };

    mockCreateClient.mockReturnValue(mockSupabase as any);

    render(<PrayerHistoryList userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByText('ขอให้มีความสุข')).toBeInTheDocument();
    });

    // Verify all fields are present
    expect(screen.getByText('ขอให้มีความสุข')).toBeInTheDocument(); // wish_text
    expect(screen.getByAltText('ของเซ่นไหว้')).toBeInTheDocument(); // offering_image
    expect(screen.getByText('SR')).toBeInTheDocument(); // tier
    expect(screen.getByText('ดีพอสมควร')).toBeInTheDocument(); // verdict
    expect(screen.getByText('ของเซ่นไม่เลว')).toBeInTheDocument(); // comment
    
    // Verify timestamp is formatted and displayed
    const timestampElements = screen.getAllByText(/15 มกราคม|January/);
    expect(timestampElements.length).toBeGreaterThan(0);
  });

  it('fetches prayers for the correct user', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    mockCreateClient.mockReturnValue(mockSupabase as any);

    render(<PrayerHistoryList userId={mockUserId} />);

    await waitFor(() => {
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
    });
  });

  it('displays offering images with correct attributes', async () => {
    const singlePrayer: Prayer[] = [
      {
        id: '1',
        user_id: mockUserId,
        wish_text: 'ขอให้โชคดี',
        offering_image_url: 'https://example.com/offering.jpg',
        tier: 'SSR',
        verdict: 'ยอดเยี่ยม',
        comment: 'สมบูรณ์แบบ',
        created_at: '2024-01-15T10:30:00Z',
      },
    ];

    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: singlePrayer,
        error: null,
      }),
    };

    mockCreateClient.mockReturnValue(mockSupabase as any);

    render(<PrayerHistoryList userId={mockUserId} />);

    await waitFor(() => {
      const image = screen.getByAltText('ของเซ่นไหว้');
      expect(image).toHaveAttribute('src', 'https://example.com/offering.jpg');
    });
  });
});
