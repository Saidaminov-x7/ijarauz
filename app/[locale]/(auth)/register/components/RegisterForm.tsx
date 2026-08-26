'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  locale: string;
}

export function RegisterForm({ locale }: RegisterFormProps) {
  const t = useTranslations('Register');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: settings } = useSiteSettings();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push(`/${locale}/profile`);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
        <CardDescription>
          {t('subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input placeholder="example@mail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('phone')}</FormLabel>
                  <FormControl>
                    <Input placeholder="998 90 123 45 67" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('password')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('confirmPassword')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('loading') : t('submit')}
            </Button>
          </form>
        </Form>

        {/* Google Auth Button - показываем только если включено в настройках */}
        {settings?.googleAuthEnabled !== false && (
          <>
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute w-full border-t border-gray-200 dark:border-gray-700" />
              <span className="relative bg-white dark:bg-gray-900 px-4 text-sm text-gray-500">или</span>
            </div>
            <GoogleAuthButton locale={locale} />
          </>
        )}
      </CardContent>
      <CardFooter className="text-sm text-stone-500 dark:text-stone-400">
        <p>
          {t('haveAccount')}{' '}
          <button
            onClick={() => router.push(`/${locale}/login`)}
            className="text-teal-600 hover:underline"
          >
            {t('login')}
          </button>
        </p>
      </CardFooter>
    </Card>
  );
}