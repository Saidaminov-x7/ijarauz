'use client';

import { use } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { ResetPasswordForm } from './components/ResetPasswordForm';

export default function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = use(searchParams);
  const { locale } = use(params);

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-white">Недействительная ссылка</h2>
            <p className="text-sm text-stone-400">
              Токен сброса пароля отсутствует или ссылка повреждена. Пожалуйста, запросите восстановление заново.
            </p>
          </div>
        </div>
        <Link
          href={`/${locale}/forgot-password`}
          className="flex h-11 w-full items-center justify-center rounded-xl bg-primary-600 font-semibold text-white transition-all hover:bg-primary-500 shadow-lg shadow-primary-900/30"
        >
          Запросить сброс пароля
        </Link>
      </div>
    );
  }

  return <ResetPasswordForm locale={locale} token={token} />;
}