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
  '/verify-email',
];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const segments = pathname.split('/').filter(Boolean);
  const maybeLocale = segments[0];
  const localeInPath = maybeLocale && locales.includes(maybeLocale as any) ? maybeLocale : null;
  const pathnameWithoutLocale = localeInPath ? `/${segments.slice(1).join('/')}` || '/' : pathname;

  // Check if this route should bypass intl middleware
  const shouldBypassIntl = bypassIntlRoutes.some(route => 
    pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(route + '/')
  );

  // These routes are not localized (they live outside app/[locale]),
  // so if a locale prefix is present, redirect to the non-prefixed route.
  if (localeInPath && shouldBypassIntl) {
    return NextResponse.redirect(new URL(pathnameWithoutLocale, request.url));
  }

  // Check if this is a protected route
  const isProtectedRoute = 
    pathnameWithoutLocale.startsWith('/portal') || 
    pathnameWithoutLocale.startsWith('/admin');

  // Check if this is an auth route (login is excluded — handled client-side to avoid stale-cookie loops)
  const isAuthRoute =
    pathnameWithoutLocale.startsWith('/register') ||
    pathnameWithoutLocale.startsWith('/my-account');

  // Get token from cookies (backend uses session_token)
  const token = request.cookies.get('session_token')?.value;

  // Protected routes - redirect to login if no token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathnameWithoutLocale);
    return NextResponse.redirect(loginUrl);
  }

  // Auth routes - redirect to dashboard if already logged in
  if (isAuthRoute && token) {
    // We'd need to decode the token to know the user type
    // If we are already on my-account, let the client-side useEffect redirect to the correct dashboard
    if (pathnameWithoutLocale.startsWith('/my-account')) {
      return NextResponse.next();
    }
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
