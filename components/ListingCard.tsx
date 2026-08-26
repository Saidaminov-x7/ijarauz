'use client';

import type { Listing } from '@/lib/data';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { cn } from '@/lib/utils';

const gradients = [
  'from-teal-500 to-emerald-700',
  'from-amber-500 to-orange-700',
  'from-sky-500 to-blue-700',
  'from-rose-500 to-pink-700',
  'from-violet-500 to-purple-700',
  'from-cyan-500 to-teal-700',
];

function typeIcon(type: Listing['type']) {
  if (type === 'room') {
    return <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="1"/><path d="M2 9h20"/><path d="M12 9v12"/></svg>;
  }
  if (type === 'daily') {
    return <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="1"/><path d="M3 11V8a2 2 0 012-2h4a2 2 0 012 2v3"/><path d="M13 11V6a2 2 0 012-2h4a2 2 0 012 2v5"/></svg>;
  }
  return <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
}

export function ListingCard({ item, locale }: { item: Listing; locale: string }) {
  const typeLabel: Record<Listing['type'], string> = {
    apartment: 'Квартира',
    room:      'Комната',
    daily:     'Посуточно',
  };

  const gradient = gradients[item.id % gradients.length];
  const isFavorite = useFavoritesStore((s) => s.isFavorite(item.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggle);

  return (
    <Link href={`/${locale}/catalog/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/8 dark:border-white/5 dark:bg-[#222222] dark:hover:shadow-black/40">

      {/* Плейсхолдер-обложка */}
      <div className={`relative aspect-4/3 overflow-hidden bg-linear-to-br ${gradient}`}>
        <div className="absolute inset-0 flex items-center justify-center text-white/25 transition-transform duration-500 group-hover:scale-110">
          {typeIcon(item.type)}
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent" />

        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-semibold text-stone-800 shadow-sm">
            {typeLabel[item.type]}
          </span>
          {item.verified && (
            <span className="rounded-full bg-teal-500/95 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
              ✓ Проверено
            </span>
          )}
        </div>

        {/* Кнопка "в избранное" */}
        <button
          type="button"
          aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(item.id);
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-stone-500 shadow-sm transition-colors hover:text-rose-500"
        >
          <Heart size={15} className={cn(isFavorite && 'fill-rose-500 text-rose-500')} />
        </button>

        {item.type === 'daily' && (
          <div className="absolute bottom-3 right-3">
            <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-white shadow">
              от ${item.price}/ночь
            </span>
          </div>
        )}
      </div>

      {/* Инфо */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold leading-snug text-stone-900 dark:text-white line-clamp-2">
          {item.title}
        </h3>

        <p className="mt-1 flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          {item.district}, {item.city}
        </p>

        <div className="mt-3 flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
            {item.rooms} комн.
          </span>
          <span className="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="1"/></svg>
            {item.area} м²
          </span>
          <span>{item.floor}/{item.totalFloors} эт.</span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3 dark:border-white/5">
          <div>
            <span className="text-base font-bold text-stone-900 dark:text-white">${item.price}</span>
            <span className="text-xs text-stone-400 dark:text-stone-500">
              {item.type === 'daily' ? '/ночь' : '/мес'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
            <svg className="text-amber-400" width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            {item.rating} ({item.reviews})
          </div>
        </div>
      </div>
    </Link>
  );
}
