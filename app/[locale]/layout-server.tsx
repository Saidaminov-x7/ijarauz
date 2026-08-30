import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import LocaleLayout from './layout-client';

const locales = ['uz', 'en', 'ru'];

async function getServerSiteSettings() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-d0a5.up.railway.app/api';
    const res = await fetch(`${apiUrl}/site-settings/public`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error('settings fetch failed');
    return await res.json();
  } catch {
    return null;
  }
}

export default async function LayoutServer({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Validate locale
  if (!locales.includes(locale)) notFound();
  
  // Enable static rendering
  setRequestLocale(locale);
  
  // Load messages
  const messages = (await import(`../../messages/${locale}.json`)).default;

  // Load server site settings for instant logo and settings render
  const initialSiteSettings = await getServerSiteSettings();
  
  return (
    <LocaleLayout params={{ locale }} messages={messages} initialSiteSettings={initialSiteSettings}>
      {children}
    </LocaleLayout>
  );
}