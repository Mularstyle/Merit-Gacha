import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Home page - Root route that redirects based on authentication status
 * 
 * Validates: Requirements 1.3
 * - Authenticated users are redirected to /shrine
 * - Unauthenticated users are redirected to /login
 */
export default async function Home() {
  const supabase = createClient();

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect based on authentication status
  if (session) {
    // User is authenticated, redirect to shrine
    redirect('/shrine');
  } else {
    // User is not authenticated, redirect to login
    redirect('/login');
  }
}
