'use client';

import { useEffect } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

/**
 * Error Boundary для сегмента [locale].
 * Next.js требует, чтобы error.tsx был клиентским компонентом.
 * reset() пытается перерендерить дерево без полной перезагрузки страницы.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // В реальном проекте здесь отправка в Sentry/аналитику
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400">
        <AlertTriangle size={28} />
      </div>
      <h1 className="text-xl font-bold text-stone-900 dark:text-white">Что-то пошло не так</h1>
      <p className="mt-2 max-w-sm text-sm text-stone-500 dark:text-stone-400">
        Произошла непредвиденная ошибка. Повторная попытка не требует перезагрузки страницы.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
      >
        <RotateCcw size={16} />
        Повторить попытку
      </button>
    </div>
  );
}
