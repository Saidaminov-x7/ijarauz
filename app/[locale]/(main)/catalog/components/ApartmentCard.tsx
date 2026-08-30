'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Star, CheckCircle, Scale } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useCompareStore } from '@/store/useCompareStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toggleFavorite as toggleFavoriteApi } from '@/lib/api';
import { Apartment } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ApartmentCardProps {
  apartment: Apartment;
  locale: string;
  activeAmenities?: string[];
}

export function ApartmentCard({ apartment, locale, activeAmenities = [] }: ApartmentCardProps) {
  const t = useTranslations('catalog');
  const tAmenities = useTranslations('amenities');
  const numericId = Number(apartment.id) || 0;

  const isFavorite = useFavoritesStore((s) => s.isFavorite(numericId));
  const toggleLocalFavorite = useFavoritesStore((s) => s.toggle);
  const isInCompare = useCompareStore((s) => s.isInCompare(numericId));
  const toggleCompare = useCompareStore((s) => s.toggle);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleLocalFavorite(numericId);

    if (isAuthenticated) {
      try {
        await toggleFavoriteApi(apartment.id);
      } catch (err) {
        console.error('Failed to sync favorite with backend:', err);
      }
    }
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(numericId);
    if (!isInCompare) {
      toast.success('Объект добавлен в список сравнения');
    } else {
      toast.info('Объект удалён из сравнения');
    }
  };

  const getCategoryBadge = () => {
    if (apartment.type === 'daily') {
      return { text: 'Посуточно', bg: 'bg-emerald-600/90 text-white' };
    }
    if (apartment.audience === 'students' || apartment.forStudents) {
      return { text: 'Студентам', bg: 'bg-amber-600/90 text-white' };
    }
    if (apartment.audience === 'families') {
      return { text: 'Для семей', bg: 'bg-indigo-600/90 text-white' };
    }
    if (apartment.audience === 'girls') {
      return { text: 'Девушкам', bg: 'bg-pink-600/90 text-white' };
    }
    if (apartment.type === 'room') {
      return { text: 'Комната', bg: 'bg-primary-700/90 text-white' };
    }
    if (apartment.type === 'house') {
      return { text: 'Дом', bg: 'bg-blue-700/90 text-white' };
    }
    return { text: 'Квартира', bg: 'bg-primary-600/90 text-white' };
  };

  // Вычисляем отсутствующие удобства из числа выбранных пользователем в фильтрах
  const apartmentAmenities = (apartment.amenities || []).map((a) => a.toUpperCase());
  const missingAmenities = activeAmenities.filter(
    (req) => !apartmentAmenities.includes(req.toUpperCase())
  );

  // Все доступные изображения
  const allImages = React.useMemo(() => {
    const list: string[] = [];
    if (Array.isArray(apartment.images) && apartment.images.length > 0) {
      apartment.images.forEach((img: any) => {
        if (typeof img === 'string' && img.trim()) list.push(img);
        else if (img?.url && typeof img.url === 'string') list.push(img.url);
        else if (img?.secure_url && typeof img.secure_url === 'string') list.push(img.secure_url);
      });
    }
    if (list.length === 0 && apartment.image && typeof apartment.image === 'string') {
      list.push(apartment.image);
    }
    return list;
  }, [apartment.images, apartment.image]);

  const [activeImgIndex, setActiveImgIndex] = React.useState(0);

  const badge = getCategoryBadge();

  return (
    <div className="group relative overflow-hidden rounded-theme font-theme border border-stone-200/80 bg-white transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/8 dark:border-white/5 dark:bg-[#1E1E1E] dark:hover:shadow-black/40">
      <Link href={`/${locale}/catalog/${apartment.id}`} className="block">
        <div
          onMouseLeave={() => setActiveImgIndex(0)}
          className="relative aspect-4/3 overflow-hidden bg-stone-100 dark:bg-stone-800 select-none cursor-pointer group/card-image"
        >
          <img
            src={allImages[activeImgIndex] || apartment.image || '/placeholder-apartment.jpg'}
            alt={apartment.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80';
            }}
          />

          {/* Интерактивные невидимые зоны для Hover Image Scrubbing */}
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

          {/* Badges on image (Стеклянные стильные пилюли) */}
          <div className="absolute left-3 top-3 right-20 flex flex-wrap items-center gap-1.5 z-20 pointer-events-none">
            <span className="inline-flex items-center rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white tracking-wide border border-white/20 shadow-md">
              {badge.text}
            </span>
            {apartment.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white shadow-md border border-emerald-400/40">
                <CheckCircle size={12} className="text-emerald-100" />
                Проверено
              </span>
            )}
            {apartment.promotionTier === 'URGENT' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-600 to-red-500 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-md border border-rose-400/50 animate-pulse">
                🔥 Срочно
              </span>
            )}
            {apartment.promotionTier === 'TOP' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-md border border-amber-300/50">
                ⭐ ТОП
              </span>
            )}
          </div>

          {/* Сегментированный индикатор прокрутки фото (Hover Image Sequence Bar) внизу */}
          {allImages.length > 1 && (
            <div className="absolute bottom-2.5 inset-x-3 flex items-center gap-1 pointer-events-none z-20 opacity-0 group-hover/card-image:opacity-100 transition-opacity duration-200">
              {allImages.map((_, idx) => (
                <div
                  key={idx}
                  className="h-1 flex-1 rounded-full bg-black/50 backdrop-blur-xs overflow-hidden"
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

          {/* Action buttons (Compare & Favorite) */}
          <div className="absolute right-3 top-3 flex items-center gap-1.5 z-30">
            <button
              type="button"
              onClick={handleCompareClick}
              aria-label="Сравнить объект"
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-md border',
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
              onClick={handleFavoriteClick}
              aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
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
        </div>

        <div className="p-4">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-stone-900 dark:text-white line-clamp-1">
              {apartment.title}
            </h3>
          </div>

          <p className="mb-3 text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
            {apartment.location}
          </p>

          <div className="flex items-center gap-4 text-xs text-stone-600 dark:text-stone-300">
            <span>
              {apartment.rooms} {t('rooms')}
            </span>
            <span>
              {apartment.area} м²
            </span>
            {apartment.floor !== undefined && (
              <span>
                {apartment.floor}{apartment.totalFloors ? `/${apartment.totalFloors}` : ''} эт.
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3 dark:border-white/5">
            <span className="text-base font-bold text-primary-600 dark:text-primary-400">
              ${apartment.price}{' '}
              <span className="text-xs font-normal text-stone-400">
                / {apartment.type === 'daily' ? 'сутки' : t('month')}
              </span>
            </span>

            {apartment.rating && (
              <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                <Star size={13} className="fill-amber-500 text-amber-500" />
                <span>{apartment.rating}</span>
                {apartment.reviews && (
                  <span className="text-stone-400 font-normal">({apartment.reviews})</span>
                )}
              </div>
            )}
          </div>

          {/* Плашка похожей квартиры по критериям (если не хватает какого-то удобства из фильтра) */}
          {missingAmenities.length > 0 && (
            <div className="mt-2.5 rounded-lg bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 border border-amber-500/20">
              ⚡ Подходит по критериям (кроме: {missingAmenities.map((m) => tAmenities(m.toLowerCase() as any) || m).join(', ')})
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}