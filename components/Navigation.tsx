'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import LogoutButton from './LogoutButton';

/**
 * Navigation component
 * Displays navigation bar with shrine and history links, logout button, and theme toggle
 * Requirements: 9.1, 9.2, 9.4
 */
export default function Navigation() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // Don't show navigation on login page or if not authenticated
  if (pathname === '/login' || !isAuthenticated) {
    return null;
  }

  return (
    <nav className="w-full bg-black/80 backdrop-blur-md border-b border-yellow-900/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand - Text Only */}
          <div className="flex-shrink-0">
            <Link
              href="/shrine"
              className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors duration-200 font-['Charm']"
            >
              <span>ศาลพระภูมิศักดิ์สิทธิ์</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-6">
            <Link
              href="/shrine"
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-none transition-colors duration-200 text-sm sm:text-base border-b-2 ${
                pathname === '/shrine'
                  ? 'border-yellow-500 text-yellow-400'
                  : 'border-transparent text-yellow-600 hover:text-yellow-400 hover:border-yellow-700'
              }`}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="hidden sm:inline">ศาลพระภูมิ</span>
            </Link>

            <Link
              href="/history"
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-none transition-colors duration-200 text-sm sm:text-base border-b-2 ${
                pathname === '/history'
                  ? 'border-yellow-500 text-yellow-400'
                  : 'border-transparent text-yellow-600 hover:text-yellow-400 hover:border-yellow-700'
              }`}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="hidden sm:inline">ประวัติ</span>
            </Link>

            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
