import { NextRequest, NextResponse } from 'next/server';

// Configuration
const locales = ['uz', 'en', 'ru'];
const defaultLocale = 'ru';

// Main proxy function
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore technical files, API routes, and static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Maintenance mode check via backend API
  const isMaintenancePage = pathname.includes('/maintenance');
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'https://api-production-ed76.up.railway.app';

  try {
    const maintenanceRes = await fetch(`${API_BASE_URL}/site-settings/public`, {
      next: { revalidate: 10 },
    });
    if (maintenanceRes.ok) {
      const data = await maintenanceRes.json();
      if (data?.maintenanceMode && !isMaintenancePage) {
        const locale = locales.find((l) => pathname.startsWith(`/${l}`)) || defaultLocale;
        const maintenanceUrl = new URL(`/${locale}/maintenance`, request.url);
        return NextResponse.redirect(maintenanceUrl);
      }
    }
  } catch {
    // Non-blocking if API fails to respond
  }

  // Check if pathname starts with a supported locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Redirect to locale-prefixed URL
    const url = new URL(`/${defaultLocale}${pathname === '/' ? '' : pathname}`, request.url);
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).*)',
  ],
};

