'use client';

import Link from 'next/link';
import { Heart, Star, CheckCircle, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toggleFavorite as toggleFavoriteApi } from '@/lib/api';
import { Apartment } from '@/types';
import { cn } from '@/lib/utils';

interface ApartmentCardProps {
  apartment: Apartment;
  locale: string;
}

export function ApartmentCard({ apartment, locale }: ApartmentCardProps) {
  const t = useTranslations('catalog');
  const numericId = Number(apartment.id) || 0;
  const isFavorite = useFavoritesStore((s) => s.isFavorite(numericId));
  const toggleLocalFavorite = useFavoritesStore((s) => s.toggle);
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
      return { text: 'Комната', bg: 'bg-teal-700/90 text-white' };
    }
    if (apartment.type === 'house') {
      return { text: 'Дом', bg: 'bg-blue-700/90 text-white' };
    }
    return { text: 'Квартира', bg: 'bg-teal-600/90 text-white' };
  };

  const badge = getCategoryBadge();

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/8 dark:border-white/5 dark:bg-[#1E1E1E] dark:hover:shadow-black/40">
      <Link href={`/${locale}/catalog/${apartment.id}`} className="block">
        <div className="relative aspect-4/3 overflow-hidden bg-stone-100 dark:bg-stone-800">
          <img
            src={apartment.image || '/placeholder-apartment.jpg'}
            alt={apartment.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80';
            }}
          />

          {/* Badges on image */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5">
            <span className={cn('rounded-lg px-2.5 py-1 text-xs font-semibold backdrop-blur-md shadow-sm', badge.bg)}>
              {badge.text}
            </span>
            {apartment.verified && (
              <span className="flex items-center gap-1 rounded-lg bg-teal-500/90 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-md shadow-sm">
                <CheckCircle size={12} />
                Проверено
              </span>
            )}
          </div>

          {/* Favorite button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-transform hover:scale-110 hover:bg-black/60 active:scale-95"
          >
            <Heart size={16} className={cn(isFavorite && 'fill-rose-500 text-rose-500')} />
          </button>
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
            <span className="text-base font-bold text-teal-600 dark:text-teal-400">
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
        </div>
      </Link>
    </div>
  );
}