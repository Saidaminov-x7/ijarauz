import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import LocaleLayout from './layout-client';

const locales = ['uz', 'en', 'ru'];

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
  
  return (
    <LocaleLayout params={{ locale }} messages={messages}>
      {children}
    </LocaleLayout>
  );
}