'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { MailCheck, AlertCircle } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email обязателен').email('Введите корректный email'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  locale: string;
}

export function ForgotPasswordForm({ locale }: ForgotPasswordFormProps) {
  const t = useTranslations('ForgotPassword');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onTouched',
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      // TODO: wire to real backend endpoint when available
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (error: any) {
      setServerError('Не удалось отправить письмо. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/10 border border-teal-500/20">
            <MailCheck size={28} className="text-teal-400" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-white">{t('successTitle')}</h2>
            <p className="text-sm text-stone-400">{t('successMessage')}</p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/${locale}/login`)}
          className="flex h-11 w-full items-center justify-center rounded-xl bg-teal-600 font-semibold text-white transition-all hover:bg-teal-500"
        >
          {t('backToLogin')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold text-white tracking-tight">{t('title')}</h1>
        <p className="text-sm text-stone-400">{t('subtitle')}</p>
      </div>

      {serverError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-in fade-in duration-200">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  {t('email')}
                </FormLabel>
                <FormControl>
                  <input
                    type="email"
                    placeholder="example@mail.com"
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-stone-500 outline-none transition-all focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-400" />
              </FormItem>
            )}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-teal-600 font-semibold text-white shadow-lg shadow-teal-900/30 transition-all hover:bg-teal-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : t('submit')}
          </button>
        </form>
      </Form>

      <p className="text-center text-sm text-stone-500">
        {t('rememberPassword')}{' '}
        <button
          type="button"
          onClick={() => router.push(`/${locale}/login`)}
          className="font-semibold text-teal-400 hover:text-teal-300 transition-colors"
        >
          {t('login')}
        </button>
      </p>
    </div>
  );
}