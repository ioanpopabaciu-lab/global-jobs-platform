import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from '@/types';

// Create the intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // No prefix for default locale (ro)
});

// Routes that should bypass intl middleware (auth and dashboard routes)
const bypassIntlRoutes = [
  '/login',
  '/register',
  '/my-account',
  '/forgot-password',
  '/portal',
  '/admin',
  '/auth',
];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this route should bypass intl middleware
  const shouldBypassIntl = bypassIntlRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Check if this is a protected route
  const isProtectedRoute = 
    pathname.startsWith('/portal') || 
    pathname.startsWith('/admin');

  // Check if this is an auth route
  const isAuthRoute = 
    pathname.startsWith('/login') || 
    pathname.startsWith('/register') ||
    pathname.startsWith('/my-account');

  // Get token from cookies (backend uses session_token)
  const token = request.cookies.get('session_token')?.value;

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

  // Bypass intl middleware for auth/dashboard routes
  if (shouldBypassIntl) {
    return NextResponse.next();
  }

  // Run intl middleware for public routes only
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - api routes
  // - _next (Next.js internals)
  // - static files
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
