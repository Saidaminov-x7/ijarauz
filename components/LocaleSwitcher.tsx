'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';

const locales = [
  {code: 'ru', label: 'Русский'},
  {code: 'uz', label: 'O\'zbek'}
] as const;

export function LocaleSwitcher({currentLocale}: {currentLocale: string}) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const rest = segments.slice(1).join('/');

  return (
    <div className="flex gap-2">
      {locales.map(({code, label}) => {
        const href = rest ? `/${code}/${rest}` : `/${code}`;
        const active = currentLocale === code;

        return (
          <Link
            key={code}
            href={href}
            className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
              active
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-gray-300 bg-white text-gray-900'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
