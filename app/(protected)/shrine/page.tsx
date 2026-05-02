import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

/**
 * Shrine page - Main prayer interface
 * This is a protected route that requires authentication
 */
export default async function ShrinePage() {
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
      <div className="max-w-4xl mx-auto">
        {/* Header with logout button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400">
            ศาลพระภูมิศักดิ์สิทธิ์
          </h1>
          <LogoutButton />
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">
          <p className="text-gray-300 text-center">
            ยินดีต้อนรับ {session.user.email}
          </p>
          <p className="text-gray-400 text-center mt-4">
            หน้านี้ได้รับการปกป้องโดย middleware
          </p>
        </div>
      </div>
    </div>
  );
}
