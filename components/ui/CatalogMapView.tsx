'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { Apartment } from '@/types';

const CatalogMapInner = dynamic(() => import('./CatalogMapInner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[350px] w-full items-center justify-center rounded-2xl bg-stone-100 text-sm text-stone-400 dark:bg-white/5 dark:text-stone-500">
      Загрузка интерактивной карты…
    </div>
  ),
});

interface CatalogMapViewProps {
  apartments: Apartment[];
  locale: string;
}

export function CatalogMapView({ apartments, locale }: CatalogMapViewProps) {
  return (
    <div className="h-[400px] w-full overflow-hidden rounded-2xl border border-stone-200/80 shadow-sm dark:border-white/10 relative">
      <CatalogMapInner apartments={apartments} locale={locale} />
    </div>
  );
}
