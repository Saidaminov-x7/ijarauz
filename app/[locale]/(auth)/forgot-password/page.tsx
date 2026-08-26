'use client';

import { use } from 'react';
import { ForgotPasswordForm } from './components/ForgotPasswordForm';

export default function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);

  return (
    <ForgotPasswordForm locale={locale} />
  );
}