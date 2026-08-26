'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/ui/ScrollToTop';

const NO_CHROME = ['/login', '/register', '/forgot-password', '/reset-password'];

function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();
  const hideChrome = NO_CHROME.some((r) => pathname === `/${locale}${r}` || pathname.startsWith(`/${locale}${r}/`));

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <Suspense fallback={<div className="h-14 border-b border-transparent" />}>
        <Header locale={locale} />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
      <ScrollToTop />
    </>
  );
}

export function AppChrome({ children }: { locale?: string; children: React.ReactNode }) {
  return <Chrome>{children}</Chrome>;
}
