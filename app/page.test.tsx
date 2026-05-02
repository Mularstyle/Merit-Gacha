/**
 * Tests for Home page redirect logic
 * 
 * Validates: Requirements 1.3
 * - Authenticated users are redirected to /shrine
 * - Unauthenticated users are redirected to /login
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Home from './page';

// Mock the dependencies
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('Home Page', () => {
  const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
  const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect authenticated users to /shrine', async () => {
    // Mock authenticated session
    const mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: {
            session: {
              user: { id: 'user-123', email: 'test@example.com' },
              access_token: 'mock-token',
            },
          },
        }),
      },
    };

    mockCreateClient.mockReturnValue(mockSupabase as any);

    // Call the component
    await Home();

    // Verify redirect to shrine
    expect(mockRedirect).toHaveBeenCalledWith('/shrine');
    expect(mockRedirect).toHaveBeenCalledTimes(1);
  });

  it('should redirect unauthenticated users to /login', async () => {
    // Mock no session (unauthenticated)
    const mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: {
            session: null,
          },
        }),
      },
    };

    mockCreateClient.mockReturnValue(mockSupabase as any);

    // Call the component
    await Home();

    // Verify redirect to login
    expect(mockRedirect).toHaveBeenCalledWith('/login');
    expect(mockRedirect).toHaveBeenCalledTimes(1);
  });

  it('should check authentication using Supabase server client', async () => {
    // Mock no session
    const mockGetSession = jest.fn().mockResolvedValue({
      data: { session: null },
    });

    const mockSupabase = {
      auth: {
        getSession: mockGetSession,
      },
    };

    mockCreateClient.mockReturnValue(mockSupabase as any);

    // Call the component
    await Home();

    // Verify Supabase client was created and session was checked
    expect(mockCreateClient).toHaveBeenCalledTimes(1);
    expect(mockGetSession).toHaveBeenCalledTimes(1);
  });
});
