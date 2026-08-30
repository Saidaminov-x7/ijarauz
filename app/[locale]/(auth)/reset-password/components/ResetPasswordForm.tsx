'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { resetPassword } from '@/lib/api';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
    confirmPassword: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  locale: string;
  token: string;
}

export function ResetPasswordForm({ locale, token }: ResetPasswordFormProps) {
  const t = useTranslations('ResetPassword');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      await resetPassword({
        token,
        password: data.password,
      });
      setIsSubmitted(true);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Не удалось сбросить пароль. Возможно, срок действия ссылки истек.';
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center animate-in fade-in duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-white">{t('successTitle')}</h2>
            <p className="text-sm text-stone-400">{t('successMessage')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/login`)}
          className="flex h-11 w-full items-center justify-center rounded-xl bg-primary-600 font-semibold text-white transition-all hover:bg-primary-500 shadow-lg shadow-primary-900/30 active:scale-[0.98]"
        >
          {t('loginWithNewPassword')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10 border border-primary-500/20">
            <KeyRound size={16} className="text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t('title')}</h1>
        </div>
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  {t('newPassword')}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 pr-11 text-sm text-white placeholder-stone-500 outline-none transition-all focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  {t('confirmPassword')}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 pr-11 text-sm text-white placeholder-stone-500 outline-none transition-all focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs text-red-400" />
              </FormItem>
            )}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-primary-600 font-semibold text-white shadow-lg shadow-primary-900/30 transition-all hover:bg-primary-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              t('submit')
            )}
          </button>
        </form>
      </Form>
    </div>
  );
}