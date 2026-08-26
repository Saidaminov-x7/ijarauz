'use client';

import { useTranslations } from 'next-intl';
import { SearchX } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmptyStateProps {
  query: string;
}

export function EmptyState({ query }: EmptyStateProps) {
  const t = useTranslations('catalog');
  const router = useRouter();

  const handleReset = () => {
    router.push(window.location.pathname);
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500 dark:bg-blue-950/40 dark:text-blue-400">
        <SearchX size={28} />
      </div>
      <h2 className="text-xl font-bold text-stone-900 dark:text-white">
        {t('nothingFound')}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-stone-500 dark:text-stone-400">
        {t.rich('nothingFoundDescription', {
          query: () => <span className="font-medium text-stone-900 dark:text-white">{query}</span>
        })}
      </p>
      <button
        onClick={handleReset}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
      >
        {t('resetSearch')}
      </button>
    </div>
  );
}