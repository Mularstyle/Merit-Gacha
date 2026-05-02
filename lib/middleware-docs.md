# Authentication Middleware

## Overview

The authentication middleware (`middleware.ts`) protects routes and ensures unauthenticated users are redirected to the login page.

## How It Works

### Protected Routes

The middleware protects the following routes:
- `/shrine` - Main prayer submission interface
- `/history` - Prayer history page

### Authentication Flow

1. **Unauthenticated Access to Protected Route**
   - User tries to access `/shrine` or `/history` without a session
   - Middleware detects no active session
   - User is redirected to `/login`

2. **Authenticated Access to Protected Route**
   - User has an active Supabase session
   - Middleware allows access to the protected route
   - Session is refreshed if needed

3. **Authenticated Access to Login Page**
   - User with active session tries to access `/login`
   - Middleware redirects to `/shrine` (default protected page)

### Session Management

The middleware uses Supabase SSR to:
- Read authentication cookies from the request
- Refresh expired sessions automatically
- Set updated cookies in the response

### Matcher Configuration

The middleware runs on all routes except:
- Static files (`_next/static`)
- Image optimization files (`_next/image`)
- Favicon and image assets (`.svg`, `.png`, `.jpg`, etc.)

## Implementation Details

### Supabase Client

The middleware creates a Supabase client with cookie handling:

```typescript
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Update cookies in both request and response
      },
    },
  }
);
```

### Session Check

```typescript
const {
  data: { session },
} = await supabase.auth.getSession();
```

### Redirect Logic

```typescript
// Redirect to login if accessing protected route without session
if (isProtectedRoute && !session) {
  const redirectUrl = new URL('/login', request.url);
  return NextResponse.redirect(redirectUrl);
}

// Redirect to shrine if accessing login with active session
if (request.nextUrl.pathname === '/login' && session) {
  const redirectUrl = new URL('/shrine', request.url);
  return NextResponse.redirect(redirectUrl);
}
```

## Testing

To test the middleware:

1. **Test Unauthenticated Access**
   - Clear browser cookies
   - Navigate to `/shrine` or `/history`
   - Should redirect to `/login`

2. **Test Authenticated Access**
   - Log in via Google OAuth
   - Navigate to `/shrine` or `/history`
   - Should display the protected page

3. **Test Login Redirect**
   - Log in via Google OAuth
   - Navigate to `/login`
   - Should redirect to `/shrine`

## Requirements Validation

This middleware satisfies:
- **Requirement 1.3**: "WHEN a User is not authenticated, THE Merit_Gacha_System SHALL redirect the User to the login page"

## Related Files

- `middleware.ts` - Main middleware implementation
- `lib/supabase/server.ts` - Supabase server client utility
- `app/(auth)/login/page.tsx` - Login page
- `app/(protected)/shrine/page.tsx` - Protected shrine page
- `app/(protected)/history/page.tsx` - Protected history page
