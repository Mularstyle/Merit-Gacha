import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Home page - Root route that redirects based on authentication status
 * 
 * Validates: Requirements 1.3
 * - Authenticated users are redirected to /shrine
 * - Unauthenticated users are redirected to /login
 * - Handles OAuth callback with code exchange
 */
export default async function Home({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  const supabase = createClient();

  // If there's an auth code, exchange it for a session
  if (searchParams.code) {
    await supabase.auth.exchangeCodeForSession(searchParams.code);
    // Redirect to shrine after successful authentication
    redirect('/shrine');
  }

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
