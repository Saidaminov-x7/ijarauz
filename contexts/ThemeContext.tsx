"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
});

const STORAGE_KEY = 'ijara_theme_preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Инициализация при монтировании из localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme);
      }
    } catch {
      // Игнорируем ошибки доступа к localStorage
    }
  }, []);

  // Применение темы к <html> и отслеживание системной темы
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let isDark = false;
      if (theme === 'system') {
        isDark = mediaQuery.matches;
      } else {
        isDark = theme === 'dark';
      }

      root.classList.remove('light', 'dark');
      root.classList.add(isDark ? 'dark' : 'light');
      setResolvedTheme(isDark ? 'dark' : 'light');
    };

    applyTheme();

    const listener = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Игнорируем ошибки
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}