import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from '@/types';

// Create the intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // No prefix for default locale (ro)
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected route
  const isProtectedRoute = 
    pathname.includes('/portal') || 
    pathname.includes('/admin');

  // Check if this is an auth route
  const isAuthRoute = 
    pathname.includes('/login') || 
    pathname.includes('/register');

  // Get token from cookies
  const token = request.cookies.get('access_token')?.value;

  // Protected routes - redirect to login if no token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth routes - redirect to dashboard if already logged in
  if (isAuthRoute && token) {
    // We'd need to decode the token to know the user type
    // For now, redirect to my-account
    return NextResponse.redirect(new URL('/my-account', request.url));
  }

  // Run intl middleware for all other routes
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - api routes
  // - _next (Next.js internals)
  // - static files
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
