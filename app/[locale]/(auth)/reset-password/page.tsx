'use client';

import { use } from 'react';
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
      <div className="rounded-lg border border-stone-200 bg-white p-6 text-center dark:border-stone-700 dark:bg-stone-800">
        <p className="text-sm text-stone-600 dark:text-stone-300">Invalid or missing reset token</p>
      </div>
    );
  }
  
  return (
    <ResetPasswordForm locale={locale} token={token} />
  );
}