import { createBrowserClient } from '@supabase/ssr';

/**
 * Create a Supabase client for use in Client Components
 * This client is used in browser-side React components
 */
export function createClient() {
  // Validate required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    console.error('[Supabase Client Error] Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!supabaseAnonKey) {
    console.error('[Supabase Client Error] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
