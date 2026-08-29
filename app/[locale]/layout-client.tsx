"use client";

import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AppChrome } from '@/components/AppChrome';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker';
import { DesignTokensInjector } from '@/components/DesignTokensInjector';
import { GlobalErrorListener } from '@/components/GlobalErrorListener';
import './globals.css';
import React from 'react';

const DEFAULT_LOCALE = 'ru';

export default function LocaleLayout({
  children,
  params,
  messages
}: {
  children: React.ReactNode;
  params: { locale: string };
  messages: Record<string, string>;
}) {
  const { locale } = params;

  if (!messages) {
    console.error('Messages not provided');
    return null;
  }
  const validLocale = locale || DEFAULT_LOCALE;

  return (
    <GoogleOAuthProvider clientId="114863832086-ubhij3d5vekmksft6g4gme9k3ncd6etb.apps.googleusercontent.com">
      <ThemeProvider>
        <NextIntlClientProvider locale={validLocale} messages={messages} timeZone="Asia/Tashkent">
          <QueryProvider>
            <GlobalErrorListener />
            <DesignTokensInjector />
            <AnalyticsTracker />
            <div className="flex min-h-screen flex-col">
              <AppChrome>{children}</AppChrome>
            </div>
            <Toaster richColors position="top-center" />
          </QueryProvider>
        </NextIntlClientProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}