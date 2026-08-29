"use client";

import React, { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface YandexMetrikaProps {
  counterId?: string;
}

/**
 * Отслеживание переходов по страницам для Яндекс.Метрики в Next.js App Router
 */
export function YandexMetrika({ counterId = "112059980" }: YandexMetrikaProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ym) {
      const url = window.location.href;
      (window as any).ym(Number(counterId), 'hit', url, {
        title: document.title,
        referrer: document.referrer,
      });
    }
  }, [pathname, searchParams, counterId]);

  return null;
}
