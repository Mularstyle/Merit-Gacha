'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * LogoutButton component
 * Handles user logout and redirects to login page
 * Requirements: 1.4, 1.5
 */
export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      
      // Sign out the user
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[Logout Error]', error);
        // Even if there's an error, we should still redirect to login
      }
      
      // Redirect to login page
      router.push('/login');
      router.refresh(); // Refresh to clear any cached data
    } catch (err) {
      console.error('[Logout Error]', err);
      // Still redirect even on error
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>กำลังออกจากระบบ...</span>
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>ออกจากระบบ</span>
        </>
      )}
    </button>
  );
}
