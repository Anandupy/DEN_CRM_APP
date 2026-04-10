import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth/session';
import { canAccessRoute, getHomeRouteForRole, getLegacyRedirect, isProtectedAppRoute } from '@/lib/auth/roles';
import { getProfileFromAccessToken } from '@/lib/auth/server';

const publicRoutes = new Set(['/sign-in']);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const legacyRedirect = getLegacyRedirect(pathname);
  if (legacyRedirect) {
    return NextResponse.redirect(new URL(legacyRedirect, request.url));
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ?? null;

  if (!accessToken) {
    if (isProtectedAppRoute(pathname)) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return NextResponse.next();
  }

  const profile = await getProfileFromAccessToken(accessToken);

  if (!profile || !profile.is_active) {
    const response = NextResponse.redirect(new URL('/sign-in', request.url));
    response.cookies.delete(ACCESS_TOKEN_COOKIE);
    return response;
  }

  if (publicRoutes.has(pathname) || pathname === '/') {
    return NextResponse.redirect(new URL(getHomeRouteForRole(profile.role), request.url));
  }

  if (isProtectedAppRoute(pathname) && !canAccessRoute(profile.role, pathname)) {
    return NextResponse.redirect(new URL(getHomeRouteForRole(profile.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
