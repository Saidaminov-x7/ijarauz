'use client';

import { Home } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Кастомная страница 404 для локализованного роутинга.
 * Использует next-intl для локализации текста.
 */
export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500 dark:bg-blue-950/40 dark:text-blue-400">
        <Home size={28} />
      </div>
      <h1 className="text-xl font-bold text-stone-900 dark:text-white">{t('title')}</h1>
      <p className="mt-2 max-w-sm text-sm text-stone-500 dark:text-stone-400">
        {t('description')}
      </p>
      <a
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
      >
        <Home size={16} />
        {t('backToHome')}
      </a>
    </div>
  );
}