'use client';

import React, { useState, useRef } from 'react';
import type { Listing } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShieldCheck, Scale, Users } from 'lucide-react';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useCompareStore } from '@/store/useCompareStore';
import { cn } from '@/lib/utils';

const gradients = [
  'from-primary-500 to-emerald-700',
  'from-amber-500 to-orange-700',
  'from-sky-500 to-blue-700',
  'from-rose-500 to-pink-700',
  'from-violet-500 to-purple-700',
  'from-cyan-500 to-primary-700',
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
  const isInCompare = useCompareStore((s) => s.isInCompare(item.id));
  const toggleCompare = useCompareStore((s) => s.toggle);

  const isVerified = item.isVerified ?? item.verified;

  // Все доступные изображения (поддерживает и массив строк, и массив объектов media, и fallback)
  const allImages = React.useMemo(() => {
    const list: string[] = [];
    if (Array.isArray(item.images) && item.images.length > 0) {
      item.images.forEach((img: any) => {
        if (typeof img === 'string' && img.trim()) list.push(img);
        else if (img?.url && typeof img.url === 'string') list.push(img.url);
        else if (img?.secure_url && typeof img.secure_url === 'string') list.push(img.secure_url);
      });
    }
    if (list.length === 0 && item.image && typeof item.image === 'string') {
      list.push(item.image);
    }
    return list;
  }, [item.images, item.image]);

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Обработчик движения мыши (0%..100% ширины)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || allImages.length <= 1) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const newIndex = Math.min(
      Math.floor(percentage * allImages.length),
      allImages.length - 1
    );
    if (newIndex !== activeImgIndex) {
      setActiveImgIndex(newIndex);
    }
  };

  const handleMouseLeave = () => {
    setActiveImgIndex(0);
  };

  // Sliding window для точек-индикаторов (максимум 6 видимых)
  const MAX_VISIBLE_DOTS = 6;
  const totalDots = allImages.length;
  let startDot = 0;
  if (totalDots > MAX_VISIBLE_DOTS) {
    startDot = Math.min(
      Math.max(0, activeImgIndex - Math.floor(MAX_VISIBLE_DOTS / 2)),
      totalDots - MAX_VISIBLE_DOTS
    );
  }
  const visibleIndices = Array.from(
    { length: Math.min(totalDots, MAX_VISIBLE_DOTS) },
    (_, i) => startDot + i
  );

  return (
    <Link
      href={`/${locale}/catalog/${item.id}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-theme font-theme border transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-xl dark:bg-[#222222] dark:hover:shadow-black/40',
        item.promotionTier === 'URGENT'
          ? 'border-rose-500/50 shadow-md shadow-rose-500/10 bg-rose-50/20 dark:bg-rose-950/10'
          : item.promotionTier === 'TOP'
          ? 'border-amber-500/50 shadow-md shadow-amber-500/10 bg-amber-50/20 dark:bg-amber-950/10'
          : 'border-stone-200/80 bg-white dark:border-white/5 hover:shadow-stone-900/8'
      )}
    >
      {/* Интерактивная фото-обложка (Hover Image Sequence / Scrubbing) */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative aspect-4/3 overflow-hidden bg-linear-to-br ${gradient} select-none cursor-pointer group/image`}
      >
        {allImages.length > 0 ? (
          <>
            <img
              src={allImages[activeImgIndex] || allImages[0]}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            {/* Невидимые hover-зоны для моментального переключения без лагов */}
            {allImages.length > 1 && (
              <div className="absolute inset-0 flex z-10">
                {allImages.map((_, idx) => (
                  <div
                    key={idx}
                    className="flex-1 h-full"
                    onMouseEnter={() => setActiveImgIndex(idx)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/25 transition-transform duration-500 group-hover:scale-110">
            {typeIcon(item.type)}
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/25 pointer-events-none" />

        {/* Скользящие сегменты прогресса фото (Hover Image Sequence Bar) внизу */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2.5 inset-x-3 flex items-center gap-1 pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {allImages.map((_, idx) => (
              <div
                key={idx}
                className="h-1 flex-1 rounded-full bg-black/40 backdrop-blur-xs overflow-hidden"
              >
                <div
                  className={cn(
                    'h-full w-full bg-white transition-all duration-150',
                    idx === activeImgIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  )}
                />
              </div>
            ))}
          </div>
        )}

        {/* Бейджи (Пилюли со стеклянным и аккуратным эффектом) */}
        <div className="absolute left-3 top-3 right-20 flex flex-wrap items-center gap-1.5 pointer-events-none z-20">
          <span className="inline-flex items-center rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white tracking-wide border border-white/20 shadow-md">
            {typeLabel[item.type] || item.type}
          </span>
          {isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white shadow-md border border-emerald-400/40">
              <ShieldCheck size={12} className="text-emerald-100" /> Проверено
            </span>
          )}
          {item.forStudents && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white shadow-md border border-indigo-400/40">
              <Users size={12} /> Соседи
            </span>
          )}
          {item.isPromoted && item.promotionTier === 'URGENT' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-600 to-red-500 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-md border border-rose-400/50 animate-pulse">
              🔥 Срочно
            </span>
          )}
          {item.isPromoted && item.promotionTier === 'TOP' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-md border border-amber-300/50">
              ⭐ ТОП
            </span>
          )}
        </div>

        {/* Кнопки действий (Избранное и Сравнение) */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 z-30">
          <button
            type="button"
            aria-label={isInCompare ? 'Убрать из сравнения' : 'Сравнить'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleCompare(item.id);
            }}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer border',
              isInCompare
                ? 'bg-primary-600 border-primary-500 text-white'
                : 'bg-black/50 border-white/20 text-white hover:bg-black/70 hover:text-primary-400'
            )}
            title={isInCompare ? 'В сравнении' : 'Добавить к сравнению'}
          >
            <Scale size={14} className={cn('transition-transform duration-200', isInCompare && 'scale-110')} />
          </button>

          <button
            type="button"
            aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(item.id);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 border border-white/20 text-white backdrop-blur-md shadow-md transition-all duration-200 hover:scale-105 hover:bg-black/70 hover:text-rose-400 active:scale-95 cursor-pointer"
            title="В избранное"
          >
            <Heart
              size={14}
              className={cn(
                'transition-transform duration-200',
                isFavorite && 'fill-rose-500 text-rose-500 scale-110'
              )}
            />
          </button>
        </div>

        {item.type === 'daily' && (
          <div className="absolute bottom-3 right-3 pointer-events-none z-20">
            <span className="inline-flex items-center rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-amber-300 border border-amber-500/30 shadow-md">
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
            {item.rating} ({item.reviews ?? 0})
          </div>
        </div>
      </div>
    </Link>
  );
}
