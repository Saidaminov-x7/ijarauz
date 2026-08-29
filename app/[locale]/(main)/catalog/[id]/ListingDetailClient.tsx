'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  Calendar,
  X,
  Share2,
  MessageSquare,
  User,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Compass,
  FileText,
  BadgeCheck,
  Eye,
  Info,
} from 'lucide-react';
import type { Listing } from '@/lib/data';
import { Gallery } from '@/components/ui/Gallery';
import { MapView } from '@/components/ui/MapView';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useCompareStore } from '@/store/useCompareStore';
import { getSimilarListings, reportListing, getPriceHistory, createViewingRequest } from '@/lib/api';
import { ListingCard } from '@/components/ListingCard';
import { AMENITY_CONFIG } from '@/app/[locale]/(main)/catalog/components/AmenitiesFilter';
import { cn } from '@/lib/utils';
import { Apartment } from '@/types';
import { Panorama360Viewer, ShareModal, LandlordReviewsSection } from '@/components/listing/InteractiveListingModules';

interface Props {
  listing: Listing;
  coordinates: { lat: number; lng: number };
  locale: string;
}

export function ListingDetailClient({ listing, coordinates, locale }: Props) {
  const router = useRouter();
  const tAmenities = useTranslations('amenities');

  const isFavorite = useFavoritesStore((s) => s.isFavorite(listing.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const isInCompare = useCompareStore((s) => s.isInCompare(listing.id));
  const toggleCompare = useCompareStore((s) => s.toggle);

  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | '360'>('photos');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);

  const [similarListings, setSimilarListings] = useState<Apartment[]>([]);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState<string>('SCAM');
  const [reportComment, setReportComment] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const [isViewingModalOpen, setIsViewingModalOpen] = useState(false);
  const [preferredDate, setPreferredDate] = useState('');
  const [viewingMessage, setViewingMessage] = useState('');
  const [isSubmittingViewing, setIsSubmittingViewing] = useState(false);

  const hasImages = (listing.images?.length ?? 0) > 0;
  const isVerified = listing.isVerified ?? listing.verified;

  // Расчёт цены в сумах (UZS) при курсе ~12,800
  const priceInUzs = (listing.price * 12800).toLocaleString('ru-RU');

  // Калькулятор депозита и коммунальных услуг
  const depositAmount = listing.price; // 1 месяц залога
  const estimatedUtilities = Math.round(listing.price * 0.08); // ~8% от стоимости аренды

  useEffect(() => {
    getSimilarListings(String(listing.id)).then(setSimilarListings);
    getPriceHistory(String(listing.id)).then(setPriceHistory);
  }, [listing.id]);

  function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(`/${locale}/catalog`);
    }
  }

  function handleRevealPhone() {
    setIsPhoneRevealed(true);
    toast.success('Номер телефона владельца открыт!');
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

  async function handleSendViewingRequest(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmittingViewing(true);
    try {
      await createViewingRequest(String(listing.id), preferredDate, viewingMessage);
      toast.success('Заявка на просмотр отправлена! Владелец свяжется с вами для подтверждения.');
      setIsViewingModalOpen(false);
      setPreferredDate('');
      setViewingMessage('');
    } catch {
      toast.error('Не удалось отправить заявку. Войдите в аккаунт или попробуйте позже.');
    } finally {
      setIsSubmittingViewing(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Верхняя навигация и быстрые действия */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-xs hover:border-teal-500 hover:text-teal-600 dark:border-white/10 dark:bg-[#1A1A1A] dark:text-stone-300 dark:hover:border-teal-500 transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Назад в каталог</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="flex h-9 px-3.5 items-center gap-1.5 rounded-xl border border-stone-200 text-stone-600 hover:text-teal-600 hover:border-teal-500 bg-white dark:border-white/10 dark:bg-[#1A1A1A] dark:text-stone-300 dark:hover:border-teal-500 transition-colors text-xs font-semibold cursor-pointer shadow-xs"
            title="Поделиться"
          >
            <Share2 size={14} />
            <span className="hidden sm:inline">Поделиться</span>
          </button>

          <button
            type="button"
            onClick={() => toggleCompare(listing.id)}
            className={cn(
              'flex h-9 px-3.5 items-center gap-1.5 rounded-xl border transition-colors text-xs font-semibold cursor-pointer shadow-xs',
              isInCompare
                ? 'border-teal-500 bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400'
                : 'border-stone-200 text-stone-600 hover:text-teal-600 bg-white dark:bg-[#1A1A1A] dark:border-white/10 dark:text-stone-300'
            )}
            title={isInCompare ? 'В сравнении' : 'Сравнить'}
          >
            <Scale size={14} />
            <span className="hidden sm:inline">{isInCompare ? 'В сравнении' : 'Сравнить'}</span>
          </button>

          <button
            type="button"
            onClick={() => toggleFavorite(listing.id)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition-colors hover:text-rose-500 dark:border-white/10 dark:bg-[#1A1A1A] dark:text-stone-400 cursor-pointer shadow-xs"
            title="В избранное"
          >
            <Heart size={16} className={cn(isFavorite && 'fill-rose-500 text-rose-500')} />
          </button>
        </div>
      </div>

      {/* Заголовок и Бейджи */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 px-3 py-0.5 text-xs font-bold shadow-xs">
              <ShieldCheck size={14} className="text-teal-600 dark:text-teal-400" /> Проверено Ijarauz (0% комиссии)
            </span>
          )}
          {listing.isPromoted && listing.promotionTier === 'URGENT' && (
            <span className="rounded-full bg-rose-500 text-white px-3 py-0.5 text-xs font-bold shadow-sm animate-pulse">
              🔥 Срочная сдача
            </span>
          )}
          {listing.isPromoted && listing.promotionTier === 'TOP' && (
            <span className="rounded-full bg-amber-500 text-white px-3 py-0.5 text-xs font-bold shadow-sm">
              ⭐ ТОП объявление
            </span>
          )}
          <span className="rounded-full bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-stone-300 px-3 py-0.5 text-xs font-semibold">
            {listing.type === 'room' ? 'Комната' : listing.type === 'daily' ? 'Посуточно' : 'Квартира'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight">
          {listing.title}
        </h1>

        <p className="flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 font-medium">
          <MapPin size={16} className="text-teal-500 shrink-0" />
          <span>{listing.district ? `${listing.city}, ${listing.district}` : listing.city}</span>
          <span className="text-stone-300 dark:text-stone-600">•</span>
          <span>Опубликовано недавно</span>
        </p>
      </div>

      {/* Главная секция: Галерея + Sticky Карточка цен & Владельца */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Левая колонка (2 части): Медиа, Характеристики, Описание, Удобства, Карта, Отзывы */}
        <div className="lg:col-span-2 space-y-8">
          {/* Галерея фотографий и 3D Панорама (360°) */}
          <div className="rounded-2xl border border-stone-200/80 dark:border-white/10 bg-white dark:bg-[#1A1A1A] p-4 shadow-sm space-y-4 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-stone-100 dark:border-white/5 pb-3">
              <button
                type="button"
                onClick={() => setActiveMediaTab('photos')}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs',
                  activeMediaTab === 'photos'
                    ? 'bg-teal-600 text-white'
                    : 'bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                )}
              >
                📷 Фотографии ({hasImages ? listing.images!.length : 1})
              </button>
              <button
                type="button"
                onClick={() => setActiveMediaTab('360')}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs',
                  activeMediaTab === '360'
                    ? 'bg-teal-600 text-white'
                    : 'bg-stone-100 dark:bg-white/5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                )}
              >
                🔄 3D Панорама (360°)
              </button>
            </div>

            {activeMediaTab === 'photos' ? (
              hasImages ? (
                <Gallery images={listing.images!} alt={listing.title} />
              ) : listing.image ? (
                <Gallery images={[listing.image]} alt={listing.title} />
              ) : (
                <div className="relative aspect-16/9 w-full rounded-2xl bg-stone-100 dark:bg-white/5 flex items-center justify-center text-stone-400">
                  <Home size={64} />
                </div>
              )
            ) : (
              <Panorama360Viewer imageUrl={listing.images?.[0] || listing.image || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600'} />
            )}
          </div>

          {/* Ключевые параметры карточки (Комнаты, Площадь, Этаж, Рейтинг) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {[
              { label: 'Комнат', value: `${listing.rooms} комн.`, icon: Home },
              { label: 'Общая площадь', value: `${listing.area} м²`, icon: Ruler },
              { label: 'Этаж', value: `${listing.floor}/${listing.totalFloors} эт.`, icon: Building2 },
              { label: 'Рейтинг жилья', value: `${listing.rating || 4.9} ★`, icon: Star },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-stone-200/80 bg-white p-4.5 text-center dark:border-white/10 dark:bg-[#1A1A1A] shadow-xs"
              >
                <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
                  <Icon size={18} />
                </div>
                <div className="text-base font-extrabold text-stone-900 dark:text-white">{value}</div>
                <div className="text-[11px] font-medium text-stone-400 dark:text-stone-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Описание объекта */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 dark:border-white/10 dark:bg-[#1A1A1A] shadow-xs space-y-3">
            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <FileText size={18} className="text-teal-500" />
              Описание объекта
            </h2>
            <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300 whitespace-pre-line">
              {listing.description ||
                'Светлая, просторная и уютная квартира со свежим современным ремонтом. Полностью меблирована, есть вся необходимая бытовая техника (кондиционер, стиральная машина, холодильник, Wi-Fi). Рядом метро, супермаркеты Korzinka и Makro, парки и школы. Сдаётся на длительный срок порядочным жильцам.'}
            </p>
          </div>

          {/* Удобства и оснащение */}
          {listing.features && listing.features.length > 0 && (
            <div className="rounded-2xl border border-stone-200/80 bg-white p-6 dark:border-white/10 dark:bg-[#1A1A1A] shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Sparkles size={18} className="text-teal-500" />
                Удобства и оснащение
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {listing.features.map((feat) => {
                  const upperKey = feat.toUpperCase();
                  const item = (AMENITY_CONFIG as any)[upperKey] || (AMENITY_CONFIG as any)[feat];
                  const Icon = item?.icon || ShieldCheck;
                  const label = item ? tAmenities(item.translationKey as any) : feat;
                  return (
                    <div
                      key={feat}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-100 dark:border-white/5 text-xs font-semibold text-stone-800 dark:text-stone-200"
                    >
                      <Icon size={16} className="text-teal-500 shrink-0" />
                      <span className="truncate">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Динамика и история цены */}
          {priceHistory.length > 0 && (
            <div className="rounded-2xl border border-stone-200/80 bg-white p-6 dark:border-white/10 dark:bg-[#1A1A1A] shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white">
                  <TrendingDown size={18} className="text-teal-600 dark:text-teal-400" />
                  <span>Динамика и история цен</span>
                </div>
                <span className="text-xs text-stone-400">
                  {priceHistory.length} фиксаций
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {priceHistory.map((item, idx) => {
                  const oldPrice = Number(item.oldPrice) || listing.price;
                  const newPrice = Number(item.newPrice) || listing.price;
                  const isDrop = newPrice < oldPrice;
                  return (
                    <div
                      key={item.id || idx}
                      className="flex items-center justify-between p-3 rounded-xl border border-stone-100 bg-stone-50/70 dark:border-white/5 dark:bg-white/5 text-xs"
                    >
                      <div>
                        <div className="font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                          <span>${newPrice}</span>
                          <span
                            className={cn(
                              'text-[10px] font-bold px-1.5 py-0.5 rounded-md',
                              isDrop ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            )}
                          >
                            {isDrop ? `Снижение на $${oldPrice - newPrice}` : `Повышение на $${newPrice - oldPrice}`}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400 mt-0.5">Ранее было: ${oldPrice}</div>
                      </div>
                      <div className="text-[11px] text-stone-500 font-medium">
                        {new Date(item.changedAt || Date.now()).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Расположение на карте */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 dark:border-white/10 dark:bg-[#1A1A1A] shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Compass size={18} className="text-teal-500" />
              Расположение на карте
            </h2>
            <MapView lat={coordinates.lat} lng={coordinates.lng} label={listing.title} />
          </div>

          {/* Отзывы об арендодателе */}
          <LandlordReviewsSection
            landlordName={listing.author?.name || 'Владелец'}
            rating={listing.rating || 4.9}
          />
        </div>

        {/* Правая колонка (1 часть): Sticky карточка цены, калькулятор и контакты */}
        <div className="space-y-6 lg:sticky lg:top-24">
          {/* Главный блок цены и аренды */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 dark:border-white/10 dark:bg-[#1A1A1A] shadow-lg space-y-5">
            <div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white tracking-tight">
                    ${listing.price}
                  </span>
                  <span className="text-xs font-semibold text-stone-400 dark:text-stone-500 ml-1.5">
                    {listing.type === 'daily' ? '/ сутки' : '/ месяц'}
                  </span>
                </div>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-lg border border-teal-500/20">
                  ≈ {priceInUzs} сум
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Без комиссии агентств • Прямой договор с собственником
              </p>
            </div>

            {/* Карточка владельца */}
            <div className="p-4 rounded-xl border border-stone-100 dark:border-white/5 bg-stone-50/80 dark:bg-white/5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {(listing.author?.name || 'С')[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white truncate">
                    {listing.author?.name || 'Собственник жилья'}
                  </h4>
                  <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1">
                    <BadgeCheck size={13} /> Номер подтверждён
                  </p>
                </div>
              </div>

              {isPhoneRevealed ? (
                <a
                  href={`tel:${listing.author?.phone || '+998901234567'}`}
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  <Phone size={16} />
                  {listing.author?.phone || '+998 90 123 45 67'}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleRevealPhone}
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all cursor-pointer"
                >
                  <Phone size={15} />
                  Показать номер телефона
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsViewingModalOpen(true)}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-xl border border-teal-600/30 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/30 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Calendar size={15} />
                Записаться на просмотр
              </button>
            </div>

            {/* Прозрачный калькулятор стоимости */}
            <div className="pt-2 border-t border-stone-100 dark:border-white/5 space-y-2.5 text-xs text-stone-600 dark:text-stone-300">
              <div className="font-bold text-stone-900 dark:text-white flex items-center justify-between">
                <span>Расчёт расходов при заселении:</span>
                <Info size={13} className="text-stone-400" />
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Аренда (1-й месяц):</span>
                <span className="font-semibold">${listing.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Страховой депозит (возвратный):</span>
                <span className="font-semibold">${depositAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Примерная коммуналка:</span>
                <span className="font-semibold">~${estimatedUtilities}/мес</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-dashed border-stone-200 dark:border-white/10 text-stone-900 dark:text-white font-bold">
                <span>Итого при заселении:</span>
                <span className="text-teal-600 dark:text-teal-400">${listing.price + depositAmount}</span>
              </div>
            </div>

            {/* Жалоба */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <AlertTriangle size={13} />
                Пожаловаться на объявление (риелтор, неверная цена)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Похожие варианты рядом */}
      {similarListings.length > 0 && (
        <div className="mt-16 pt-10 border-t border-stone-200 dark:border-white/10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white">
              Похожие варианты рядом
            </h2>
            <span className="text-xs text-stone-400">Рекомендации по району</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {similarListings.slice(0, 3).map((similar) => (
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

      {/* Модальное окно шаринга */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={listing.title}
        price={listing.price}
        district={listing.district}
        city={listing.city}
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />

      {/* Модальное окно записи на просмотр */}
      {isViewingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="card max-w-md w-full p-6 space-y-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Calendar size={18} className="text-teal-500" />
                Запись на просмотр квартиры
              </h3>
              <button onClick={() => setIsViewingModalOpen(false)} className="text-stone-400 hover:text-stone-600 dark:hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendViewingRequest} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Желаемая дата и время:
                </label>
                <input
                  type="datetime-local"
                  required
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/5 text-xs text-stone-900 dark:text-white outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Комментарий владельцу (необязательно):
                </label>
                <textarea
                  rows={3}
                  value={viewingMessage}
                  onChange={(e) => setViewingMessage(e.target.value)}
                  placeholder="Здравствуйте! Хотели бы прийти вдвоем посмотреть квартиру..."
                  className="w-full p-3 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/5 text-xs text-stone-900 dark:text-white outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsViewingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-white/5 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingViewing || !preferredDate}
                  className="btn btn-primary text-xs py-2 px-5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingViewing ? 'Отправка...' : 'Отправить заявку'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно жалобы */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="card max-w-md w-full p-6 space-y-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2 text-rose-600">
                <AlertTriangle size={18} />
                Пожаловаться на объявление
              </h3>
              <button onClick={() => setIsReportModalOpen(false)} className="text-stone-400 hover:text-stone-600 dark:hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendReport} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Причина жалобы:
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/5 text-xs text-stone-900 dark:text-white outline-none focus:border-rose-500"
                >
                  <option value="REALTOR">Скрытый риелтор / требование комиссии</option>
                  <option value="SCAM">Мошенничество / требование предоплаты на карту</option>
                  <option value="WRONG_PRICE">Неверная цена или параметры</option>
                  <option value="ALREADY_RENTED">Квартира уже сдана</option>
                  <option value="FAKE_PHOTOS">Чужие фотографии / фейк</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Подробности (необязательно):
                </label>
                <textarea
                  rows={3}
                  value={reportComment}
                  onChange={(e) => setReportComment(e.target.value)}
                  placeholder="Опишите, что именно произошло при контакте..."
                  className="w-full p-3 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/5 text-xs text-stone-900 dark:text-white outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-white/5 cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="btn bg-rose-600 hover:bg-rose-500 text-white text-xs py-2 px-5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReport ? 'Отправка...' : 'Отправить модераторам'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
