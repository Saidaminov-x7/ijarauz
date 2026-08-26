'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { loginSchema, LoginFormValues } from '../schemas/loginSchema';
import { useAuth } from '../hooks/useAuth';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface LoginFormProps {
  locale: string;
}

export function LoginForm({ locale }: LoginFormProps) {
  const t = useTranslations('Login');
  const router = useRouter();
  const { isLoading, error, handleLogin } = useAuth(locale);
  const [showPass, setShowPass] = useState(false);
  const { data: settings } = useSiteSettings();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    await handleLogin(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold text-white tracking-tight">{t('title')}</h1>
        <p className="text-sm text-stone-400">{t('subtitle')}</p>
      </div>

      {/* Server error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  {t('emailOrPhone')}
                </FormLabel>
                <FormControl>
                  <input
                    placeholder="example@mail.com"
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-stone-500 outline-none ring-0 transition-all focus:border-teal-500/50 focus:bg-white/8 focus:ring-2 focus:ring-teal-500/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  {t('password')}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 pr-11 text-sm text-white placeholder-stone-500 outline-none transition-all focus:border-teal-500/50 focus:bg-white/8 focus:ring-2 focus:ring-teal-500/20"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs text-red-400" />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push(`/${locale}/forgot-password`)}
              className="text-xs text-stone-400 hover:text-teal-400 transition-colors"
            >
              {t('forgotPassword')}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="relative flex h-11 w-full items-center justify-center overflow-hidden rounded-xl bg-teal-600 font-semibold text-white shadow-lg shadow-teal-900/30 transition-all hover:bg-teal-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Google Auth Button - показываем только если включено в настройках */}
      {settings?.googleAuthEnabled !== false && (
        <>
          <div className="relative my-1 flex items-center justify-center">
            <div className="absolute w-full border-t border-white/20" />
            <span className="relative bg-transparent px-4 text-xs text-stone-400">или</span>
          </div>
          <GoogleAuthButton locale={locale} />
        </>
      )}

      <p className="text-center text-sm text-stone-500">
        {t('noAccount')}{' '}
        <button
          type="button"
          onClick={() => router.push(`/${locale}/register`)}
          className="font-semibold text-teal-400 hover:text-teal-300 transition-colors"
        >
          {t('createAccount')}
        </button>
      </p>
    </div>
  );
}
