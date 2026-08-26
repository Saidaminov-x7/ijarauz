"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';

const locales = ['uz', 'en', 'ru'];

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();

  const handleLocaleChange = (newLocale: string) => {
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/'
    
    // Redirect to the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <div className={`flex gap-2 ${className || ''}`}>
      {locales.map((locale) => (
        <Button
          key={locale}
          variant={currentLocale === locale ? 'default' : 'outline'}
          onClick={() => handleLocaleChange(locale)}
          className="uppercase"
        >
          {locale}
        </Button>
      ))}
    </div>
  );
}