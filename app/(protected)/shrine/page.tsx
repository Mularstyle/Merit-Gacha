import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ShrineClient from './ShrineClient';

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
    <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-950/40 via-black to-black text-yellow-50 p-8">
      <div className="max-w-4xl mx-auto">
        <ShrineClient />
      </div>
    </div>
  );
}
