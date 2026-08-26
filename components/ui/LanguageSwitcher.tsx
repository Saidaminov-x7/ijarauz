"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';

const locales = ['uz', 'en', 'ru'];

export function LanguageSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();

  const handleLocaleChange = (newLocale: string) => {
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';

    // Redirect to the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <div className="flex gap-1 rounded-lg bg-stone-100 p-1 dark:bg-stone-800">
      {locales.map((loc) => (
        <Button
          key={loc}
          variant={currentLocale === loc ? 'default' : 'ghost'}
          onClick={() => handleLocaleChange(loc)}
          className={`px-3 py-1 text-sm ${currentLocale === loc ? 'bg-white dark:bg-stone-700' : ''}`}
        >
          {loc.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}
