'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    try {
      const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (backendBaseUrl) {
        fetch(`${backendBaseUrl}/error-reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: error.message || 'Unknown global error',
            stack: error.stack || '',
            url: typeof window !== 'undefined' ? window.location.href : '',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            severity: 'error',
          }),
        }).catch(() => {});
      }
    } catch {
      // ignore reporting errors
    }
  }, [error]);

  return (
    <html lang="ru">
      <body className="flex min-h-screen items-center justify-center bg-stone-50 p-4 font-sans text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-lg dark:border-white/10 dark:bg-stone-900">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-lg font-bold">Что-то пошло не так</h2>
          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
            Произошла непредвиденная ошибка. Мы уже получили отчёт и работаем над исправлением.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary-600 px-5 text-xs font-semibold text-white hover:bg-primary-700 transition-colors"
            >
              Попробовать снова
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.location.href = '/';
              }}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-stone-200 px-4 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-white/10 dark:text-stone-300 dark:hover:bg-stone-800 transition-colors"
            >
              На главную
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
