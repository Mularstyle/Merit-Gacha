import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Auth callback route
 * Handles OAuth callback from Supabase and exchanges code for session
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createClient();
    
    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to shrine after successful authentication
  return NextResponse.redirect(`${origin}/shrine`);
}
