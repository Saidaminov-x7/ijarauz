'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Heart, Phone, MapPin, Home, Ruler, Building2, Star } from 'lucide-react';
import type { Listing } from '@/lib/data';
import { Gallery } from '@/components/ui/Gallery';
import { MapView } from '@/components/ui/MapView';
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

interface Props {
  listing: Listing;
  coordinates: { lat: number; lng: number };
  locale: string;
}

export function ListingDetailClient({ listing, coordinates, locale }: Props) {
  const isFavorite = useFavoritesStore((s) => s.isFavorite(listing.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const gradient = gradients[listing.id % gradients.length];
  const hasImages = (listing.images?.length ?? 0) > 0;

  function handleContact() {
    // TODO: заменить на реальный вызов apiClient (например, отправка лида владельцу)
    toast.success('Заявка отправлена! Арендодатель свяжется с вами.');
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href={`/${locale}/catalog`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white"
      >
        <ArrowLeft size={14} />
        Назад в каталог
      </Link>

      {/* Галерея или градиент-плейсхолдер, если реальных фото нет */}
      {hasImages ? (
        <Gallery images={listing.images!} alt={listing.title} />
      ) : (
        <div className={cn('flex aspect-video items-center justify-center rounded-2xl bg-linear-to-br text-white/30', gradient)}>
          <Home size={64} strokeWidth={1.2} />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{listing.title}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
            <MapPin size={14} />
            {listing.district}, {listing.city}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => toggleFavorite(listing.id)}
            aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 text-stone-500 transition-colors hover:text-rose-500 dark:border-white/10 dark:text-stone-400"
          >
            <Heart size={18} className={cn(isFavorite && 'fill-rose-500 text-rose-500')} />
          </button>
          <div className="text-right">
            <span className="text-2xl font-bold text-stone-900 dark:text-white">${listing.price}</span>
            <span className="text-sm text-stone-400 dark:text-stone-500">{listing.type === 'daily' ? '/ночь' : '/мес'}</span>
          </div>
        </div>
      </div>

      {/* Ключевые параметры */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Комнат',  value: listing.rooms,                                icon: Home },
          { label: 'Площадь', value: `${listing.area} м²`,                        icon: Ruler },
          { label: 'Этаж',    value: `${listing.floor}/${listing.totalFloors}`,   icon: Building2 },
          { label: 'Рейтинг', value: `${listing.rating} ★`,                        icon: Star },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-stone-200/80 bg-white p-4 text-center dark:border-white/5 dark:bg-[#222222]">
            <Icon className="mx-auto mb-1.5 text-teal-500" size={16} />
            <div className="text-lg font-bold text-stone-900 dark:text-white">{value}</div>
            <div className="text-xs text-stone-400 dark:text-stone-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Описание */}
      {listing.description && (
        <div className="mt-6">
          <h2 className="mb-2 text-lg font-semibold text-stone-900 dark:text-white">Описание</h2>
          <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">{listing.description}</p>
        </div>
      )}

      {/* Удобства */}
      <div className="mt-6 flex flex-wrap gap-2">
        {listing.features.map((f) => (
          <span key={f} className="rounded-full border border-stone-200 bg-white px-3.5 py-1 text-xs font-medium text-stone-600 dark:border-white/10 dark:bg-[#222222] dark:text-stone-300">
            {f}
          </span>
        ))}
      </div>

      {/* Карта — динамически подгружается только на клиенте (см. components/ui/MapView.tsx) */}
      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-stone-900 dark:text-white">Расположение</h2>
        <MapView lat={coordinates.lat} lng={coordinates.lng} label={listing.title} />
      </div>

      {/* CTA */}
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleContact}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
        >
          <Phone size={16} />
          Связаться с арендодателем
        </button>
      </div>
    </div>
  );
}
