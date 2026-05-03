import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PrayerHistoryList from '@/components/PrayerHistoryList';
import EasterEggButton from './EasterEggButton';

/**
 * History page - View past prayers
 * This is a protected route that requires authentication
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
 */
export default async function HistoryPage() {
  const supabase = createClient();

  // Get the current user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Double-check authentication (middleware should handle this, but good practice)
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Easter Egg Button */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-yellow-400">
            ประวัติคำขอพร
          </h1>
          <EasterEggButton />
        </div>
        
        {/* Prayer history list */}
        <PrayerHistoryList userId={session.user.id} />
      </div>
    </div>
  );
}
