import { render, screen } from '@testing-library/react';
import Navigation from './Navigation';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

// Mock LogoutButton
jest.mock('./LogoutButton', () => {
  return function MockLogoutButton() {
    return <button>ออกจากระบบ</button>;
  };
});

describe('Navigation', () => {
  const mockUsePathname = usePathname as jest.Mock;
  const mockCreateClient = createClient as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render on login page', async () => {
    mockUsePathname.mockReturnValue('/login');
    mockCreateClient.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { id: '123' } } },
        }),
        onAuthStateChange: jest.fn().mockReturnValue({
          data: { subscription: { unsubscribe: jest.fn() } },
        }),
      },
    });

    const { container } = render(<Navigation />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render when not authenticated', async () => {
    mockUsePathname.mockReturnValue('/shrine');
    mockCreateClient.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: null },
        }),
        onAuthStateChange: jest.fn().mockReturnValue({
          data: { subscription: { unsubscribe: jest.fn() } },
        }),
      },
    });

    const { container } = render(<Navigation />);
    
    // Wait for useEffect to complete
    await screen.findByText('ศาลพระภูมิศักดิ์สิทธิ์', {}, { timeout: 100 }).catch(() => {});
    
    expect(container.firstChild).toBeNull();
  });

  it('should render navigation with shrine and history links when authenticated', async () => {
    mockUsePathname.mockReturnValue('/shrine');
    mockCreateClient.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { id: '123' } } },
        }),
        onAuthStateChange: jest.fn().mockReturnValue({
          data: { subscription: { unsubscribe: jest.fn() } },
        }),
      },
    });

    render(<Navigation />);

    // Wait for component to render after auth check
    const brandLink = await screen.findByText('ศาลพระภูมิศักดิ์สิทธิ์');
    expect(brandLink).toBeInTheDocument();

    const shrineLink = screen.getByText('ศาลเจ้า');
    expect(shrineLink).toBeInTheDocument();

    const historyLink = screen.getByText('ประวัติ');
    expect(historyLink).toBeInTheDocument();

    const logoutButton = screen.getByText('ออกจากระบบ');
    expect(logoutButton).toBeInTheDocument();
  });

  it('should highlight active shrine link', async () => {
    mockUsePathname.mockReturnValue('/shrine');
    mockCreateClient.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { id: '123' } } },
        }),
        onAuthStateChange: jest.fn().mockReturnValue({
          data: { subscription: { unsubscribe: jest.fn() } },
        }),
      },
    });

    render(<Navigation />);

    const shrineLink = await screen.findByText('ศาลเจ้า');
    expect(shrineLink.closest('a')).toHaveClass('bg-yellow-600');
  });

  it('should highlight active history link', async () => {
    mockUsePathname.mockReturnValue('/history');
    mockCreateClient.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { id: '123' } } },
        }),
        onAuthStateChange: jest.fn().mockReturnValue({
          data: { subscription: { unsubscribe: jest.fn() } },
        }),
      },
    });

    render(<Navigation />);

    const historyLink = await screen.findByText('ประวัติ');
    expect(historyLink.closest('a')).toHaveClass('bg-yellow-600');
  });

  it('should use Thai language for all labels', async () => {
    mockUsePathname.mockReturnValue('/shrine');
    mockCreateClient.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { id: '123' } } },
        }),
        onAuthStateChange: jest.fn().mockReturnValue({
          data: { subscription: { unsubscribe: jest.fn() } },
        }),
      },
    });

    render(<Navigation />);

    // Verify Thai text is present
    await screen.findByText('ศาลพระภูมิศักดิ์สิทธิ์');
    expect(screen.getByText('ศาลเจ้า')).toBeInTheDocument();
    expect(screen.getByText('ประวัติ')).toBeInTheDocument();
    expect(screen.getByText('ออกจากระบบ')).toBeInTheDocument();
  });
});
