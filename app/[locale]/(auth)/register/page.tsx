'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { register, login, getMe } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

function isWeakPassword(pwd: string): boolean {
  // Sequential digits: 12345678, 87654321 etc
  const sequential = /(?:0(?=1)|1(?=2)|2(?=3)|3(?=4)|4(?=5)|5(?=6)|6(?=7)|7(?=8)|8(?=9)){4,}/;
  const reverseSeq = /(?:9(?=8)|8(?=7)|7(?=6)|6(?=5)|5(?=4)|4(?=3)|3(?=2)|2(?=1)|1(?=0)){4,}/;
  // All same character: 11111111
  const allSame = /^(.)\1+$/;
  // Common weak passwords list
  const weak = ['12345678', '123456789', '1234567890', 'password', 'qwerty123', 'qwertyui', 'abc12345', '11111111', '00000000', 'password1', 'pass1234'];
  const lower = pwd.toLowerCase();
  return sequential.test(pwd) || reverseSeq.test(pwd) || allSame.test(pwd) || weak.includes(lower);
}

const registerSchema = z.object({
  name: z.string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(80, 'Имя слишком длинное'),
  email: z.string()
    .min(1, 'Email обязателен')
    .email('Введите корректный email'),
  phone: z.string()
    .min(9, 'Введите номер телефона')
    .regex(/^\+?[0-9\s\-\(\)]{9,20}$/, 'Некорректный формат телефона (пример: +998901234567)'),
  password: z.string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(/[A-Za-z]/, 'Пароль должен содержать буквы')
    .regex(/[0-9]/, 'Пароль должен содержать цифры')
    .refine((p) => !isWeakPassword(p), 'Пароль слишком простой. Используйте буквы, цифры и символы.'),
  confirmPassword: z.string().min(1, 'Подтвердите пароль'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'ru';
  const setAuth = useAuthStore((s) => s.setAuth);

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '+998', password: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      await register({
        name: data.name,
        email: data.email,
        phone: data.phone.trim(),
        password: data.password,
        role: 'USER',
      });

      const loginRes = await login(data.email, data.password);
      const token = loginRes.accessToken || loginRes.token;
      let user = loginRes.user;

      if (!user && token) {
        useAuthStore.getState().setToken(token);
        user = await getMe();
      }
      if (token && user) setAuth(user, token);

      router.push(`/${locale}/profile`);
    } catch (error: any) {
      const status = error.response?.status;
      const backendMsg = error.response?.data?.message;
      if (status === 409 || (backendMsg && backendMsg.toLowerCase().includes('exist'))) {
        setServerError('Пользователь с таким email уже существует');
      } else if (status === 400 && backendMsg) {
        setServerError(backendMsg);
      } else if (!error.response) {
        setServerError('Нет соединения с сервером. Проверьте интернет.');
      } else {
        setServerError('Ошибка регистрации. Попробуйте позже.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold text-white tracking-tight">Регистрация</h1>
        <p className="text-sm text-stone-400">Создайте аккаунт, чтобы сохранять избранное и публиковать объявления</p>
      </div>

      {serverError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Имя</FormLabel>
                <FormControl>
                  <input
                    placeholder="Ваше имя"
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-stone-500 outline-none transition-all focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Email</FormLabel>
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

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Телефон</FormLabel>
                <FormControl>
                  <input
                    placeholder="+998 90 123 45 67"
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-stone-500 outline-none transition-all focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20"
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
                <FormLabel className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Пароль</FormLabel>
                <FormControl>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 pr-10 text-sm text-white placeholder-stone-500 outline-none transition-all focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20"
                      {...field}
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs text-red-400" />
              </FormItem>
            )}
          />

          {/* Password strength hints */}
          {form.watch('password') && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 -mt-1">
              {[
                { ok: form.watch('password').length >= 8, text: 'Мин. 8 символов' },
                { ok: /[A-Za-z]/.test(form.watch('password')), text: 'Есть буквы' },
                { ok: /[0-9]/.test(form.watch('password')), text: 'Есть цифры' },
                { ok: !isWeakPassword(form.watch('password')), text: 'Не простой' },
              ].map(({ ok, text }) => (
                <div key={text} className={`flex items-center gap-1 text-xs ${ok ? 'text-teal-400' : 'text-stone-500'}`}>
                  <CheckCircle2 size={11} className={ok ? 'opacity-100' : 'opacity-30'} />
                  {text}
                </div>
              ))}
            </div>
          )}

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Повторите пароль</FormLabel>
                <FormControl>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 pr-10 text-sm text-white placeholder-stone-500 outline-none transition-all focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20"
                      {...field}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300">
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
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
            className="flex h-11 w-full items-center justify-center rounded-xl bg-teal-600 font-semibold text-white shadow-lg shadow-teal-900/30 transition-all hover:bg-teal-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : 'Зарегистрироваться'}
          </button>
        </form>
      </Form>

      <div className="relative flex items-center justify-center">
        <div className="absolute w-full border-t border-white/8" />
        <span className="relative bg-transparent px-4 text-xs text-stone-500">или</span>
      </div>

      <GoogleAuthButton locale={locale} mode="register" />

      <p className="text-center text-sm text-stone-500">
        Уже есть аккаунт?{' '}
        <button
          type="button"
          onClick={() => router.push(`/${locale}/login`)}
          className="font-semibold text-teal-400 hover:text-teal-300 transition-colors"
        >
          Войти
        </button>
      </p>
    </div>
  );
}