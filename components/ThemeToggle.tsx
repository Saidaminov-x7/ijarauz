'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

// Тот же самый единый стиль кнопок (40x40px, рамка, фон), что и в Header.tsx
const BTN_CLASS =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ' +
  'border-stone-200 bg-white text-stone-600 transition-all duration-200 ' +
  'hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900 ' +
  'dark:border-white/10 dark:bg-stone-900 dark:text-stone-300 ' +
  'dark:hover:border-white/20 dark:hover:bg-stone-800 dark:hover:text-white ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div className="h-10 w-10 shrink-0 rounded-xl border border-transparent" aria-hidden />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Light theme' : 'Dark theme'}
      className={BTN_CLASS}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}