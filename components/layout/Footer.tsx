'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useSiteSettings } from '@/hooks/useSiteSettings';


function Accordion({
  title,
  links,
  locale,
}: {
  title: string;
  links: { href: string; label: string }[];
  locale: string;
}) {
  const [open, setOpen] = useState(false);
  const to = (p: string) => `/${locale}${p}`;
  return (
    <div className="border-b border-stone-100 dark:border-white/5 sm:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-sm font-semibold text-stone-900 dark:text-white sm:hidden"
      >
        {title}
        <svg
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <ul className={`flex flex-col gap-2.5 pb-4 sm:hidden ${open ? '' : 'hidden'}`}>
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link href={to(href)} className="text-sm text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="hidden sm:block">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-white">{title}</h3>
        <ul className="flex flex-col gap-2.5">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link href={to(href)} className="text-sm text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-white">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Footer({ locale: localeProp }: { locale?: string }) {
  const pathname = usePathname();
  const locale = useLocale() || localeProp || 'ru';
  
  // Hide footer on authentication routes
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].some(
    (r) => pathname === `/${locale}${r}` || pathname.startsWith(`/${locale}${r}/`)
  );

  if (isAuthPage) {
    return null;
  }

  const t = useTranslations('Footer');
  const { data: settings } = useSiteSettings();
  const to = (p: string) => `/${locale}${p}`;

  const columns = [
    {
      title: t('explore'),
      links: [
        { href: '/catalog', label: t('allListings') },
        { href: '/favorites', label: t('favorites') },
        { href: '/about', label: t('about') },
      ],
    },
    {
      title: t('landlords'),
      links: [
        { href: '/add-listing', label: t('addListing') },
        { href: '/about', label: t('aboutService') },
      ],
    },
    {
      title: t('support'),
      links: [
        { href: '/privacy', label: t('privacy') },
        { href: '/terms', label: t('terms') },
      ],
    },
  ];


  return (
    <footer className="w-full border-t border-stone-200/60 bg-white dark:border-white/5 dark:bg-[#222222]">
      {/* Изменено на max-w-[1440px] */}
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4 lg:gap-12">
          <div className="flex flex-col gap-4 border-b border-stone-100 pb-6 dark:border-white/5 sm:border-0 sm:pb-0">
            <Link href={to('/')} className="flex items-center gap-2">
              <img src={settings?.logoUrl || '/logotip.png'} alt={settings?.siteName || 'Ijarauz'} className="h-6" />
            </Link>
            <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400">{t('slogan')}</p>
            <div className="flex gap-2">
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-teal-600 dark:hover:bg-white/10 dark:hover:text-teal-400"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.922 14.44l-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.228.119z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-pink-500 dark:hover:bg-white/10 dark:hover:text-pink-400"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <Accordion key={col.title} title={col.title} links={col.links} locale={locale} />
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-stone-100 pt-8 dark:border-white/5 sm:flex-row">
          <p className="text-xs text-stone-400 dark:text-stone-500">
            © {new Date().getFullYear()} ijarauz. {t('allRightsReserved')}
          </p>
          <div className="flex gap-5">
            <Link href={to('/privacy')} className="text-xs text-stone-400 transition-colors hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300">
              {t('privacy')}
            </Link>
            <Link href={to('/terms')} className="text-xs text-stone-400 transition-colors hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300">
              {t('terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}