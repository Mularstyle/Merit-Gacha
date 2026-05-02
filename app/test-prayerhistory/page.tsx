'use client';

import { useState, useEffect } from 'react';
import PrayerHistoryList from '@/components/PrayerHistoryList';
import { createClient } from '@/lib/supabase/client';

/**
 * Test page for PrayerHistoryList component
 * This page allows testing the component in isolation
 */
export default function TestPrayerHistoryPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setUserId(session.user.id);
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-400">Please log in to view prayer history</p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-yellow-500 text-gray-900 rounded-lg font-bold hover:bg-yellow-600 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">
            Test: PrayerHistoryList Component
          </h1>
          <p className="text-gray-400">
            Testing the prayer history list component with user ID: {userId}
          </p>
        </div>

        <PrayerHistoryList userId={userId} />
      </div>
    </div>
  );
}
