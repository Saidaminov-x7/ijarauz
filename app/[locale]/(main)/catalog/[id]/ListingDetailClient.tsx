'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Heart,
  Phone,
  MapPin,
  Home,
  Ruler,
  Building2,
  Star,
  ShieldCheck,
  Scale,
  AlertTriangle,
  TrendingDown,
  X,
} from 'lucide-react';
import type { Listing } from '@/lib/data';
import { Gallery } from '@/components/ui/Gallery';
import { MapView } from '@/components/ui/MapView';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useCompareStore } from '@/store/useCompareStore';
import { getSimilarListings, reportListing, getPriceHistory } from '@/lib/api';
import { ListingCard } from '@/components/ListingCard';
import { cn } from '@/lib/utils';
import { Apartment } from '@/types';

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
  const isInCompare = useCompareStore((s) => s.isInCompare(listing.id));
  const toggleCompare = useCompareStore((s) => s.toggle);

  const [similarListings, setSimilarListings] = useState<Apartment[]>([]);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState<string>('SCAM');
  const [reportComment, setReportComment] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const gradient = gradients[listing.id % gradients.length];
  const hasImages = (listing.images?.length ?? 0) > 0;
  const isVerified = listing.isVerified ?? listing.verified;

  useEffect(() => {
    getSimilarListings(String(listing.id)).then(setSimilarListings);
    getPriceHistory(String(listing.id)).then(setPriceHistory);
  }, [listing.id]);

  function handleContact() {
    toast.success('Заявка отправлена! Арендодатель свяжется с вами.');
  }

  async function handleSendReport(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmittingReport(true);
    try {
      await reportListing(
        String(listing.id),
        reportReason as any,
        reportComment,
      );
      toast.success('Жалоба отправлена модераторам. Спасибо за бдительность!');
      setIsReportModalOpen(false);
      setReportComment('');
    } catch {
      toast.error('Не удалось отправить жалобу. Попробуйте позже.');
    } finally {
      setIsSubmittingReport(false);
    }
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

      {/* Галерея или градиент-плейсхолдер */}
      {hasImages ? (
        <Gallery images={listing.images!} alt={listing.title} />
      ) : (
        <div className={cn('flex aspect-video items-center justify-center rounded-2xl bg-linear-to-br text-white/30', gradient)}>
          <Home size={64} strokeWidth={1.2} />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 min-w-[280px]">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 px-3 py-0.5 text-xs font-bold">
                <ShieldCheck size={14} className="text-teal-600 dark:text-teal-400" /> Проверено Ijarauz
              </span>
            )}
            {listing.isPromoted && listing.promotionTier === 'URGENT' && (
              <span className="rounded-full bg-rose-500 text-white px-2.5 py-0.5 text-xs font-bold shadow-sm animate-pulse">
                🔥 Срочно
              </span>
            )}
            {listing.isPromoted && listing.promotionTier === 'TOP' && (
              <span className="rounded-full bg-amber-500 text-white px-2.5 py-0.5 text-xs font-bold shadow-sm">
                ⭐ ТОП
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white leading-tight">
            {listing.title}
          </h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
            <MapPin size={14} className="text-teal-500" />
            {listing.district}, {listing.city}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => toggleCompare(listing.id)}
            aria-label={isInCompare ? 'Убрать из сравнения' : 'Добавить в сравнение'}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl border transition-colors',
              isInCompare
                ? 'border-teal-500 bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400'
                : 'border-stone-200 text-stone-500 hover:text-teal-600 dark:border-white/10 dark:text-stone-400'
            )}
            title={isInCompare ? 'В сравнении' : 'Добавить к сравнению'}
          >
            <Scale size={18} />
          </button>

          <button
            type="button"
            onClick={() => toggleFavorite(listing.id)}
            aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 text-stone-500 transition-colors hover:text-rose-500 dark:border-white/10 dark:text-stone-400"
          >
            <Heart size={18} className={cn(isFavorite && 'fill-rose-500 text-rose-500')} />
          </button>

          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">${listing.price}</span>
            <span className="text-xs text-stone-400 dark:text-stone-500 block">{listing.type === 'daily' ? 'за сутки' : 'в месяц'}</span>
          </div>
        </div>
      </div>

      {/* История изменения цены (если есть записи) */}
      {priceHistory.length > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
          <TrendingDown size={16} className="shrink-0 text-amber-600" />
          <span>
            История цены: последнее изменение зафиксировано {new Date(priceHistory[priceHistory.length - 1].changedAt).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Ключевые параметры */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Комнат',  value: listing.rooms,                                icon: Home },
          { label: 'Площадь', value: `${listing.area} м²`,                        icon: Ruler },
          { label: 'Этаж',    value: `${listing.floor}/${listing.totalFloors}`,   icon: Building2 },
          { label: 'Рейтинг', value: `${listing.rating} ★`,                        icon: Star },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-stone-200/80 bg-white p-4 text-center dark:border-white/5 dark:bg-[#222222]">
            <Icon className="mx-auto mb-1.5 text-teal-500" size={18} />
            <div className="text-lg font-bold text-stone-900 dark:text-white">{value}</div>
            <div className="text-xs text-stone-400 dark:text-stone-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Описание */}
      {listing.description && (
        <div className="mt-8">
          <h2 className="mb-2 text-lg font-bold text-stone-900 dark:text-white">Описание</h2>
          <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300 whitespace-pre-line bg-white dark:bg-[#222222] p-5 rounded-2xl border border-stone-200/80 dark:border-white/5">
            {listing.description}
          </p>
        </div>
      )}

      {/* Удобства */}
      {listing.features && listing.features.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-bold text-stone-900 dark:text-white">Удобства</h2>
          <div className="flex flex-wrap gap-2">
            {listing.features.map((f) => (
              <span key={f} className="rounded-xl border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-700 dark:border-white/10 dark:bg-[#222222] dark:text-stone-300 shadow-xs">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Карта */}
      <div className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-stone-900 dark:text-white">Расположение на карте</h2>
        <MapView lat={coordinates.lat} lng={coordinates.lng} label={listing.title} />
      </div>

      {/* CTA & Действия */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-200 dark:border-white/10">
        <button
          type="button"
          onClick={handleContact}
          className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition-transform hover:-translate-y-0.5 hover:bg-teal-700"
        >
          <Phone size={16} />
          Связаться с арендодателем
        </button>

        <button
          type="button"
          onClick={() => setIsReportModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-rose-600 transition-colors"
        >
          <AlertTriangle size={14} />
          Пожаловаться на объявление
        </button>
      </div>

      {/* Похожие варианты рядом */}
      {similarListings.length > 0 && (
        <div className="mt-14 pt-8 border-t border-stone-200 dark:border-white/10">
          <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-6">
            Похожие варианты рядом
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {similarListings.map((similar) => (
              <ListingCard
                key={similar.id}
                item={{
                  id: Number(similar.id) || 1,
                  title: similar.title,
                  price: similar.price,
                  city: similar.city || similar.location,
                  district: similar.district || '',
                  type: (similar.type as any) || 'apartment',
                  rooms: similar.rooms,
                  area: similar.area,
                  floor: similar.floor || 1,
                  totalFloors: similar.totalFloors || 9,
                  furnished: true,
                  image: similar.image || '',
                  features: similar.amenities || [],
                  forStudents: false,
                  rating: similar.rating || 4.8,
                  reviews: similar.reviews || 5,
                  verified: !!similar.isVerified || !!similar.verified,
                  isPromoted: similar.isPromoted,
                  promotionTier: similar.promotionTier,
                }}
                locale={locale}
              />
            ))}
          </div>
        </div>
      )}

      {/* Модальное окно подачи жалобы */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#1c1c1c] border border-stone-200 dark:border-white/10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="text-rose-500" size={20} />
                Пожаловаться на объявление
              </h3>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Причина жалобы
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="SCAM">Мошенничество / Подозрительное предложение</option>
                  <option value="ALREADY_RENTED">Объект уже сдан или неактуален</option>
                  <option value="WRONG_PRICE">Не соответствует указанная цена</option>
                  <option value="WRONG_PHOTOS">Фейковые или чужие фотографии</option>
                  <option value="DUPLICATE">Дубликат другого объявления</option>
                  <option value="OTHER">Другая причина</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Комментарий (необязательно)
                </label>
                <textarea
                  rows={3}
                  value={reportComment}
                  onChange={(e) => setReportComment(e.target.value)}
                  placeholder="Опишите подробнее, что не так с этим объявлением..."
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-stone-500 hover:bg-stone-100 dark:hover:bg-white/5"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {isSubmittingReport ? 'Отправка...' : 'Отправить жалобу'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
