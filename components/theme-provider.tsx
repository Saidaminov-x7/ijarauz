'use client';

import { ThemeProvider as CustomThemeProvider } from '@/contexts/ThemeContext';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <CustomThemeProvider>{children}</CustomThemeProvider>;
}