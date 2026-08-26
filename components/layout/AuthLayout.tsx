"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AuthLayout({
  children,
  locale
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/95 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/95">
        <div className="container mx-auto px-4">
          <div className="flex h-24 items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Назад</span>
            </button>
          </div>
        </div>
      </header>
      <main className="flex min-h-[calc(100vh-96px)] items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}


