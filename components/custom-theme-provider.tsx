"use client";

import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface CustomThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export function CustomThemeProvider({
  children,
  enableSystem = true,
  disableTransitionOnChange = false,
}: CustomThemeProviderProps) {
  const { theme } = useTheme();

  const currentTheme = theme === 'system' && enableSystem ? 'dark' : theme;

  // Единственный эффект для управления классами темы в DOM
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (currentTheme) {
      root.classList.add(currentTheme);
    }

    if (!disableTransitionOnChange) {
      root.classList.add('[&_*]:!transition-none');
      const timer = setTimeout(() => {
        root.classList.remove('[&_*]:!transition-none');
      }, 1);

      return () => clearTimeout(timer);
    }
  }, [currentTheme, disableTransitionOnChange]);

  return <>{children}</>;
}